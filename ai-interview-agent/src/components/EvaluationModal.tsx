import React from 'react';
import { QuestionEvaluation } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Award, 
  ChevronRight,
  Lightbulb
} from 'lucide-react';

interface EvaluationModalProps {
  evaluation: QuestionEvaluation;
  currentQuestionIndex: number;
  totalQuestions: number;
  onProceed: () => void;
  isLastQuestion: boolean;
  isLoadingNext: boolean;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  evaluation,
  currentQuestionIndex,
  totalQuestions,
  onProceed,
  isLastQuestion,
  isLoadingNext
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500 text-white';
    if (score >= 5) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const getScoreText = (score: number) => {
    if (score >= 8) return 'Excellent Answer';
    if (score >= 6) return 'Good Answer';
    if (score >= 4) return 'Partial Answer';
    return 'Needs Improvement';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-xl shadow-md ${getScoreColor(evaluation.score)}`}>
              {evaluation.score}/10
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-white">{getScoreText(evaluation.score)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Q{evaluation.questionNumber} ({evaluation.difficulty})
                </span>
              </div>
              <p className="text-xs text-slate-400">Question {currentQuestionIndex + 1} of {totalQuestions} evaluated by AI</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-cyan-300 text-xs font-medium border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Instant AI Feedback
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Question & Candidate Answer */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Question</span>
              <p className="font-bold text-slate-900 text-sm">{evaluation.question}</p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Answer</span>
              <p className="text-slate-700 text-xs sm:text-sm bg-white p-3 rounded-lg border border-slate-200 mt-1 font-mono whitespace-pre-wrap">
                {evaluation.candidateAnswer || '(No answer entered)'}
              </p>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" /> Evaluation & Key Takeaways
            </h3>
            <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl text-indigo-950 text-sm leading-relaxed">
              {evaluation.feedback}
            </div>
          </div>

          {/* Model Correct Answer */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" /> Expected / Model Correct Answer
            </h3>
            <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-emerald-950 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {evaluation.correctAnswer}
            </div>
          </div>

          {/* Topics to Improve */}
          {evaluation.topicsToImprove && evaluation.topicsToImprove.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-600">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Topics to Study / Refine
              </h3>
              <div className="flex flex-wrap gap-2">
                {evaluation.topicsToImprove.map((topic, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 hidden sm:block">
            {isLastQuestion ? 'All 5 questions finished!' : `Question ${currentQuestionIndex + 1} completed`}
          </p>

          <button
            id="proceed-next-question-btn"
            onClick={onProceed}
            disabled={isLoadingNext}
            className="w-full sm:w-auto ml-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoadingNext ? (
              <span>Generating Report...</span>
            ) : isLastQuestion ? (
              <>
                <span>Generate Final Evaluation Report</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Next Question (Q{currentQuestionIndex + 2})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
