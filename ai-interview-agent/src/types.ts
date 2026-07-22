export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Scenario Based';

export interface InterviewQuestion {
  id: number;
  question: string;
  difficulty: QuestionDifficulty;
  focus: string;
}

export interface QuestionEvaluation {
  questionNumber: number;
  question: string;
  difficulty: QuestionDifficulty;
  candidateAnswer: string;
  score: number; // out of 10
  feedback: string;
  correctAnswer: string;
  topicsToImprove: string[];
}

export interface FinalEvaluationReport {
  overallScore: number; // total score out of 50
  maxScore: number; // 50
  percentage: number;
  status: 'Selected' | 'Consider' | 'Needs Improvement';
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  topicsToImprove: string[];
  learningResources: { title: string; type: string; description: string }[];
  summary: string;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  role: string;
  experience: string;
  createdAt: string;
  timerSecondsPerQuestion: number;
  questions: InterviewQuestion[];
  evaluations: QuestionEvaluation[];
  finalReport?: FinalEvaluationReport;
  currentQuestionIndex: number;
  status: 'setup' | 'in_progress' | 'evaluating_question' | 'completed';
}

export interface HistoryRecord {
  id: string;
  candidateName: string;
  role: string;
  experience: string;
  overallScore: number;
  maxScore: number;
  status: string;
  recommendation: string;
  createdAt: string;
  questionsCount: number;
  data: InterviewSession;
}
