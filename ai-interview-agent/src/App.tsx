import React, { useState } from 'react';
import { Header } from './components/Header';
import { RoleSelection } from './components/RoleSelection';
import { InterviewScreen } from './components/InterviewScreen';
import { EvaluationModal } from './components/EvaluationModal';
import { ResultReport } from './components/ResultReport';
import { HistoryView } from './components/HistoryView';
import { SampleTranscript } from './components/SampleTranscript';
import { InterviewSession, QuestionEvaluation, FinalEvaluationReport } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'sample'>('new');
  
  // Active Interview state
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [isGeneratingFinalReport, setIsGeneratingFinalReport] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<QuestionEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Start new interview: Generate questions
  const handleStartInterview = async (
    candidateName: string,
    role: string,
    experience: string,
    timerSeconds: number
  ) => {
    setIsGeneratingQuestions(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateName, role, experience })
      });
      const data = await res.json();

      if (!data.success || !data.session) {
        throw new Error(data.error || 'Failed to generate interview questions');
      }

      const newSession: InterviewSession = {
        ...data.session,
        timerSecondsPerQuestion: timerSeconds
      };

      setSession(newSession);
      setCurrentEvaluation(null);
      setActiveTab('new');
    } catch (err: any) {
      console.error('Error starting interview:', err);
      setErrorMessage(err?.message || 'Error generating questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Submit Answer for AI evaluation
  const handleSubmitAnswer = async (answerText: string) => {
    if (!session) return;
    setIsEvaluatingAnswer(true);
    setErrorMessage(null);

    const currentQ = session.questions[session.currentQuestionIndex];

    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          questionNumber: currentQ.id,
          question: currentQ.question,
          difficulty: currentQ.difficulty,
          candidateAnswer: answerText,
          role: session.role
        })
      });
      const data = await res.json();

      if (!data.success || !data.evaluation) {
        throw new Error(data.error || 'Failed to evaluate answer');
      }

      const evaluation: QuestionEvaluation = data.evaluation;
      setCurrentEvaluation(evaluation);

      // Update evaluations in local session state
      const updatedEvals = [
        ...session.evaluations.filter((ev) => ev.questionNumber !== currentQ.id),
        evaluation
      ].sort((a, b) => a.questionNumber - b.questionNumber);

      setSession((prev) =>
        prev
          ? {
              ...prev,
              evaluations: updatedEvals,
              status: 'evaluating_question'
            }
          : null
      );
    } catch (err: any) {
      console.error('Error evaluating answer:', err);
      setErrorMessage(err?.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  // Proceed to Next Question or Final Evaluation Report
  const handleProceedNext = async () => {
    if (!session) return;

    const isLast = session.currentQuestionIndex >= session.questions.length - 1;

    if (!isLast) {
      // Advance to next question
      setSession((prev) =>
        prev
          ? {
              ...prev,
              currentQuestionIndex: prev.currentQuestionIndex + 1,
              status: 'in_progress'
            }
          : null
      );
      setCurrentEvaluation(null);
    } else {
      // Last question completed -> Generate Final Evaluation Report
      setIsGeneratingFinalReport(true);
      setErrorMessage(null);

      try {
        const res = await fetch('/api/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            candidateName: session.candidateName,
            role: session.role,
            experience: session.experience,
            evaluations: session.evaluations
          })
        });
        const data = await res.json();

        if (!data.success || !data.report) {
          throw new Error(data.error || 'Failed to generate final report');
        }

        const report: FinalEvaluationReport = data.report;

        setSession((prev) =>
          prev
            ? {
                ...prev,
                finalReport: report,
                status: 'completed'
              }
            : null
        );
        setCurrentEvaluation(null);
      } catch (err: any) {
        console.error('Error generating final report:', err);
        setErrorMessage(err?.message || 'Failed to generate final evaluation report');
      } finally {
        setIsGeneratingFinalReport(false);
      }
    }
  };

  const handleResetSession = () => {
    setSession(null);
    setCurrentEvaluation(null);
    setActiveTab('new');
  };

  const inActiveInterview = session !== null && session.status !== 'completed';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} inActiveInterview={inActiveInterview} />

      <main className="flex-1">
        {/* Global Error Alert */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 pt-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="font-bold underline text-xs">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: New Interview Flow */}
        {activeTab === 'new' && (
          <>
            {!session && (
              <RoleSelection onStartInterview={handleStartInterview} isLoading={isGeneratingQuestions} />
            )}

            {session && session.status !== 'completed' && (
              <InterviewScreen
                candidateName={session.candidateName}
                role={session.role}
                question={session.questions[session.currentQuestionIndex]}
                currentIndex={session.currentQuestionIndex}
                totalQuestions={session.questions.length}
                timerSecondsPerQuestion={session.timerSecondsPerQuestion}
                onSubmitAnswer={handleSubmitAnswer}
                isEvaluating={isEvaluatingAnswer}
              />
            )}

            {/* Per-Question Evaluation Modal */}
            {currentEvaluation && session && (
              <EvaluationModal
                evaluation={currentEvaluation}
                currentQuestionIndex={session.currentQuestionIndex}
                totalQuestions={session.questions.length}
                onProceed={handleProceedNext}
                isLastQuestion={session.currentQuestionIndex >= session.questions.length - 1}
                isLoadingNext={isGeneratingFinalReport}
              />
            )}

            {/* Completed Session Report */}
            {session && session.status === 'completed' && session.finalReport && (
              <ResultReport
                candidateName={session.candidateName}
                role={session.role}
                experience={session.experience}
                evaluations={session.evaluations}
                report={session.finalReport}
                onRetake={handleResetSession}
                sessionId={session.id}
              />
            )}
          </>
        )}

        {/* Tab 2: Interview History View */}
        {activeTab === 'history' && (
          <HistoryView onStartNew={handleResetSession} />
        )}

        {/* Tab 3: Sample Transcript Showcase */}
        {activeTab === 'sample' && (
          <SampleTranscript onStartNew={handleResetSession} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} AI Interview Agent — Full-Stack Technical Screening Platform</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => setActiveTab('sample')}>Sample Transcript</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => setActiveTab('history')}>SQLite Database</span>
            <span>•</span>
            <a href="/api/download-zip" download className="text-emerald-600 hover:text-emerald-700 font-semibold">Download ZIP</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
