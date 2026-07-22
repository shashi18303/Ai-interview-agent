import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { getAllSessions, getSessionById, saveSession, deleteSessionById } from './src/lib/database.ts';
import { InterviewQuestion, QuestionEvaluation, FinalEvaluationReport, InterviewSession } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// ==========================================
// API ROUTE 1: Generate 5 Interview Questions
// POST /api/generate
// ==========================================
app.post('/api/generate', async (req, res) => {
  try {
    const { role = 'Java Developer', candidateName = 'Candidate', experience = 'Mid-Level' } = req.body;

    const systemPrompt = `You are an experienced technical interviewer conducting a technical interview for a ${experience} ${role}.
Generate EXACTLY 5 technical interview questions tailored for a ${role}.
The difficulty MUST increase gradually:
Question 1: Easy (Core fundamentals)
Question 2: Medium (Intermediate concepts & practical usage)
Question 3: Medium (Concurrency, performance, or deep domain knowledge)
Question 4: Hard (Edge cases, internals, system behavior under load)
Question 5: Scenario Based (Real-world system design, architecture, or bug fixing scenario)

Return strict JSON array with 5 objects matching schema.`;

    const ai = getAIClient();
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate 5 interview questions for role: ${role}, experience level: ${experience}. Candidate name: ${candidateName}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              difficulty: {
                type: Type.STRING,
                description: "Must be one of: 'Easy', 'Medium', 'Medium', 'Hard', 'Scenario Based'"
              },
              focus: { type: Type.STRING, description: "Topic focus area e.g. Data Structures, OOP, Spring Boot" }
            },
            required: ['id', 'question', 'difficulty', 'focus']
          }
        }
      }
    });

    let questions: InterviewQuestion[] = [];
    try {
      const rawText = aiResponse.text || '[]';
      questions = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse AI question response JSON, falling back:', parseErr);
    }

    // Fallback if AI response was empty or malformed
    if (!questions || questions.length < 5) {
      questions = [
        {
          id: 1,
          question: `What are the core fundamentals and architecture of ${role}?`,
          difficulty: 'Easy',
          focus: 'Core Fundamentals'
        },
        {
          id: 2,
          question: `Explain a key data structure or design pattern frequently used by a ${role}.`,
          difficulty: 'Medium',
          focus: 'Data Structures & Design Patterns'
        },
        {
          id: 3,
          question: `How do you manage state, concurrency, or performance optimization in ${role}?`,
          difficulty: 'Medium',
          focus: 'Performance & Concurrency'
        },
        {
          id: 4,
          question: `Describe how you debug complex race conditions or production memory issues as a ${role}.`,
          difficulty: 'Hard',
          focus: 'Debugging & Internal Mechanics'
        },
        {
          id: 5,
          question: `Design a scalable system/API for a high-traffic production module for ${role}.`,
          difficulty: 'Scenario Based',
          focus: 'System Architecture'
        }
      ];
    }

    // Ensure IDs 1 to 5
    questions = questions.map((q, idx) => ({
      ...q,
      id: idx + 1,
      difficulty: idx === 0 ? 'Easy' : idx === 1 || idx === 2 ? 'Medium' : idx === 3 ? 'Hard' : 'Scenario Based'
    }));

    const sessionId = `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newSession: InterviewSession = {
      id: sessionId,
      candidateName,
      role,
      experience,
      createdAt: new Date().toISOString(),
      timerSecondsPerQuestion: 180,
      questions,
      evaluations: [],
      currentQuestionIndex: 0,
      status: 'in_progress'
    };

    saveSession(newSession);

    return res.json({
      success: true,
      sessionId,
      session: newSession
    });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to generate interview questions' });
  }
});

// ==========================================
// API ROUTE 2: Evaluate Candidate Answer
// POST /api/answer
// ==========================================
app.post('/api/answer', async (req, res) => {
  try {
    const {
      sessionId,
      questionNumber,
      question,
      difficulty = 'Medium',
      candidateAnswer,
      role = 'Software Developer'
    } = req.body;

    if (!question || candidateAnswer === undefined) {
      return res.status(400).json({ success: false, error: 'Question and candidateAnswer are required' });
    }

    const systemPrompt = `You are an expert technical interviewer evaluating a candidate's answer for the position of ${role}.
Evaluate the candidate's answer based on:
1. Accuracy
2. Completeness
3. Technical Knowledge & Depth
4. Communication & Clarity

Assign an integer score out of 10 (0 = incorrect/blank, 5 = partial/basic, 8 = strong, 10 = exceptional/flawless).
Provide clear, constructive feedback detailing strengths and missing elements.
Provide the comprehensive correct / ideal model answer.
List 1 to 3 specific topics to improve.`;

    const ai = getAIClient();
    const prompt = `Question (${difficulty}): "${question}"
Candidate Answer: "${candidateAnswer || '(No answer provided)'}"
Role: ${role}`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score out of 10' },
            feedback: { type: Type.STRING, description: 'Constructive feedback' },
            correctAnswer: { type: Type.STRING, description: 'Ideal comprehensive correct answer' },
            topicsToImprove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of topics to improve'
            }
          },
          required: ['score', 'feedback', 'correctAnswer', 'topicsToImprove']
        }
      }
    });

    let evalData = {
      score: 5,
      feedback: 'Answer recorded. Evaluated based on domain standard.',
      correctAnswer: 'An ideal answer explains the underlying core concepts, performance trade-offs, and edge cases clearly.',
      topicsToImprove: ['Core domain concepts']
    };

    try {
      const rawText = aiResponse.text || '{}';
      const parsed = JSON.parse(rawText);
      evalData = {
        score: typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : 5,
        feedback: parsed.feedback || 'Evaluated answer.',
        correctAnswer: parsed.correctAnswer || 'Model answer provided.',
        topicsToImprove: Array.isArray(parsed.topicsToImprove) ? parsed.topicsToImprove : []
      };
    } catch (e) {
      console.error('Failed to parse AI evaluation JSON:', e);
    }

    const questionEval: QuestionEvaluation = {
      questionNumber: questionNumber || 1,
      question,
      difficulty: difficulty as any,
      candidateAnswer: candidateAnswer || '(Skipped / Timeout)',
      score: evalData.score,
      feedback: evalData.feedback,
      correctAnswer: evalData.correctAnswer,
      topicsToImprove: evalData.topicsToImprove
    };

    // Update DB if sessionId is passed
    if (sessionId) {
      const existing = getSessionById(sessionId);
      if (existing) {
        const session = existing.data;
        // Filter out any prior evaluation for this question number if re-answered
        session.evaluations = session.evaluations.filter((ev) => ev.questionNumber !== questionNumber);
        session.evaluations.push(questionEval);
        session.evaluations.sort((a, b) => a.questionNumber - b.questionNumber);
        session.currentQuestionIndex = Math.max(session.currentQuestionIndex, questionNumber);
        saveSession(session);
      }
    }

    return res.json({
      success: true,
      evaluation: questionEval
    });
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to evaluate answer' });
  }
});

// ==========================================
// API ROUTE 3: Final Comprehensive Report
// POST /api/result
// ==========================================
app.post('/api/result', async (req, res) => {
  try {
    const { sessionId, candidateName, role, experience, evaluations } = req.body;

    const evals: QuestionEvaluation[] = evaluations || [];
    const totalScore = evals.reduce((sum, e) => sum + (e.score || 0), 0);
    const maxScore = evals.length * 10 || 50;
    const percentage = Math.round((totalScore / maxScore) * 100);

    const systemPrompt = `You are a Chief Technology Officer / Senior Interview Committee Leader.
Generate a final comprehensive hiring evaluation report for candidate "${candidateName}" who interviewed for the position of "${role}" (${experience}).

Total Score: ${totalScore} out of ${maxScore} (${percentage}%).

Individual Question Performance:
${evals.map((e, idx) => `Q${idx + 1} (${e.difficulty}): Score ${e.score}/10. Q: "${e.question}". Candidate Answer: "${e.candidateAnswer}". Feedback: "${e.feedback}"`).join('\n')}

Generate:
1. Status: Must be one of 'Selected', 'Consider', 'Needs Improvement'. (If score >= 35 Selected, 25-34 Consider, < 25 Needs Improvement).
2. Recommendation: A clear 1-2 sentence recommendation for the hiring manager.
3. Strengths: 3 distinct technical strengths demonstrated.
4. Weaknesses: 2-3 specific technical gaps identified.
5. TopicsToImprove: List of 3 key topics to study.
6. LearningResources: Array of 2 structured learning resources with title, type ('Book', 'Course', 'Documentation', 'Practice'), and description.
7. Summary: Comprehensive executive summary paragraph.`;

    const ai = getAIClient();
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate final interview evaluation report for candidate ${candidateName} for ${role}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "'Selected', 'Consider', or 'Needs Improvement'"
            },
            recommendation: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            topicsToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
            learningResources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['title', 'type', 'description']
              }
            },
            summary: { type: Type.STRING }
          },
          required: ['status', 'recommendation', 'strengths', 'weaknesses', 'topicsToImprove', 'learningResources', 'summary']
        }
      }
    });

    let finalReport: FinalEvaluationReport = {
      overallScore: totalScore,
      maxScore,
      percentage,
      status: percentage >= 70 ? 'Selected' : percentage >= 50 ? 'Consider' : 'Needs Improvement',
      recommendation: percentage >= 70 ? `Candidate demonstrated strong competence for the ${role} position.` : `Candidate shows promise but needs further preparation in key domain topics.`,
      strengths: ['Demonstrated technical understanding in answered topics'],
      weaknesses: ['Could expand further on complex scenario edge-cases'],
      topicsToImprove: evals.flatMap((e) => e.topicsToImprove || []).slice(0, 4),
      learningResources: [
        {
          title: `${role} Mastery & Best Practices Guide`,
          type: 'Documentation',
          description: `Comprehensive technical documentation and architectural patterns for ${role}.`
        }
      ],
      summary: `${candidateName} scored ${totalScore}/${maxScore} (${percentage}%) across ${evals.length} technical interview questions.`
    };

    try {
      const rawText = aiResponse.text || '{}';
      const parsed = JSON.parse(rawText);
      finalReport = {
        overallScore: totalScore,
        maxScore,
        percentage,
        status: (['Selected', 'Consider', 'Needs Improvement'].includes(parsed.status) ? parsed.status : finalReport.status) as any,
        recommendation: parsed.recommendation || finalReport.recommendation,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : finalReport.strengths,
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : finalReport.weaknesses,
        topicsToImprove: Array.isArray(parsed.topicsToImprove) ? parsed.topicsToImprove : finalReport.topicsToImprove,
        learningResources: Array.isArray(parsed.learningResources) ? parsed.learningResources : finalReport.learningResources,
        summary: parsed.summary || finalReport.summary
      };
    } catch (parseErr) {
      console.error('Error parsing final report JSON:', parseErr);
    }

    // Save session in SQLite / DB
    if (sessionId) {
      const existing = getSessionById(sessionId);
      if (existing) {
        const session = existing.data;
        session.finalReport = finalReport;
        session.status = 'completed';
        saveSession(session);
      }
    }

    return res.json({
      success: true,
      report: finalReport
    });
  } catch (error: any) {
    console.error('Error generating final result:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to generate final report' });
  }
});

// ==========================================
// API ROUTE 4: Database History & Export
// GET /api/history
// GET /api/history/:id
// GET /api/export/:id
// DELETE /api/history/:id
// ==========================================
app.get('/api/history', (req, res) => {
  try {
    const records = getAllSessions();
    return res.json({ success: true, count: records.length, records });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.get('/api/history/:id', (req, res) => {
  try {
    const record = getSessionById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Session record not found' });
    }
    return res.json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.get('/api/export/:id', (req, res) => {
  try {
    const record = getSessionById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Session record not found' });
    }
    const transcript = {
      export_version: '1.0',
      exported_at: new Date().toISOString(),
      candidate_details: {
        id: record.data.id,
        name: record.data.candidateName,
        role: record.data.role,
        experience: record.data.experience,
        date: record.data.createdAt
      },
      evaluation_summary: record.data.finalReport,
      question_transcript: record.data.evaluations
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="interview-transcript-${record.data.candidateName.replace(/\s+/g, '_')}.json"`);
    return res.send(JSON.stringify(transcript, null, 2));
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/history/:id', (req, res) => {
  try {
    const success = deleteSessionById(req.params.id);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

import AdmZip from 'adm-zip';

// API ROUTE 5: Download Complete Source Zip Archive
app.get('/api/download-zip', (req, res) => {
  try {
    const zip = new AdmZip();
    const projectRoot = process.cwd();

    // Add key files
    const filesToInclude = [
      'README.md',
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'metadata.json',
      'server.ts',
      'index.html',
      '.env.example'
    ];

    filesToInclude.forEach((file) => {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        zip.addLocalFile(filePath);
      }
    });

    // Add directories
    const dirsToInclude = ['src', 'outputs', 'data'];
    dirsToInclude.forEach((dir) => {
      const dirPath = path.join(projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        zip.addLocalFolder(dirPath, dir);
      }
    });

    const buffer = zip.toBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-interview-agent-source.zip"');
    return res.send(buffer);
  } catch (err: any) {
    console.error('Error creating ZIP archive:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to create ZIP file' });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Interview Agent Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
