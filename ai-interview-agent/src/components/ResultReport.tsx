import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FinalEvaluationReport, QuestionEvaluation } from '../types';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Briefcase, 
  ChevronDown, 
  ChevronUp,
  FileJson
} from 'lucide-react';

interface ResultReportProps {
  candidateName: string;
  role: string;
  experience: string;
  evaluations: QuestionEvaluation[];
  report: FinalEvaluationReport;
  onRetake: () => void;
  sessionId: string;
}

export const ResultReport: React.FC<ResultReportProps> = ({
  candidateName,
  role,
  experience,
  evaluations,
  report,
  onRetake,
  sessionId
}) => {
  const [expandedQ, setExpandedQ] = React.useState<number | null>(null);

  // Trigger confetti if score >= 35
  useEffect(() => {
    if (report.overallScore >= 35) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn('Confetti fail:', e);
      }
    }
  }, [report.overallScore]);

  const handleDownloadJSON = () => {
    const transcriptData = {
      export_version: '1.0',
      generated_at: new Date().toISOString(),
      session_id: sessionId,
      candidate: {
        name: candidateName,
        role,
        experience
      },
      final_evaluation: report,
      questions_and_answers: evaluations
    };

    const blob = new Blob([JSON.stringify(transcriptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${candidateName.replace(/\s+/g, '_')}-${role.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selected':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          badgeBg: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
          text: 'Selected / Strong Candidate'
        };
      case 'Consider':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          badgeBg: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          text: 'Consider for Next Round'
        };
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          badgeBg: 'bg-rose-600 text-white',
          icon: XCircle,
          text: 'Needs Improvement'
        };
    }
  };

  const statusConfig = getStatusBadge(report.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 print:p-0 print:max-w-none">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Executive Interview Evaluation Summary
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {candidateName}
            </h1>
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Target Role: <strong className="text-slate-900">{role}</strong> ({experience})</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              id="export-transcript-json-btn"
              onClick={handleDownloadJSON}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <FileJson className="w-4 h-4 text-cyan-400" />
              <span>Export transcript.json</span>
            </button>

            <button
              id="print-report-btn"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              id="retake-interview-btn"
              onClick={onRetake}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Interview</span>
            </button>
          </div>
        </div>

        {/* Score & Verdict Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-inner">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Score</p>
            <div className="my-3 flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold tracking-tight text-white">{report.overallScore}</span>
              <span className="text-xl text-slate-400 font-bold">/ {report.maxScore}</span>
              <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {report.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, report.percentage))}%` }}
              />
            </div>
          </div>

          {/* Verdict Status */}
          <div className={`p-6 rounded-2xl border ${statusConfig.bg} flex flex-col justify-between`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Screening Status</span>
              <div className="flex items-center space-x-2 mt-2">
                <StatusIcon className="w-6 h-6 text-slate-900" />
                <span className="text-lg font-extrabold text-slate-900">{report.status}</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 mt-3 leading-relaxed font-medium">
              {report.recommendation}
            </p>
          </div>

          {/* Executive Summary */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Executive Summary</span>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed line-clamp-4">
                {report.summary}
              </p>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase mt-2">Evaluated by AI Agent</span>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Identified Key Strengths
          </h2>
          <ul className="space-y-2.5">
            {report.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" /> Key Knowledge Gaps & Weaknesses
          </h2>
          <ul className="space-y-2.5">
            {report.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  !
                </span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Transcript */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Full Interview Question Transcript & Scores</h2>
            <p className="text-xs text-slate-500">Detailed breakdown of each question, candidate answer, and AI model correct answer</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
            5 Questions Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {evaluations.map((ev, idx) => {
            const isExpanded = expandedQ === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/50">
                <div
                  onClick={() => setExpandedQ(isExpanded ? null : idx)}
                  className="p-4 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      ev.score >= 8 ? 'bg-emerald-100 text-emerald-800' : ev.score >= 5 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ev.score}/10
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Q{idx + 1} ({ev.difficulty})
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{ev.question}</h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-indigo-600 hidden sm:inline">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4 text-xs sm:text-sm">
                    {/* Candidate Answer */}
                    <div>
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Candidate Answer</span>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 mt-1 font-mono text-slate-800 whitespace-pre-wrap">
                        {ev.candidateAnswer || '(Empty answer)'}
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div>
                      <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px]">AI Evaluation & Feedback</span>
                      <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200 text-indigo-950 mt-1">
                        {ev.feedback}
                      </div>
                    </div>

                    {/* Model Correct Answer */}
                    <div>
                      <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px]">Model Correct Answer</span>
                      <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 text-emerald-950 font-mono mt-1 whitespace-pre-wrap">
                        {ev.correctAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Learning Resources & Study Topics */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Recommended Learning Plan & Resources</h2>
            <p className="text-xs text-slate-500">Topics and materials recommended to bridge identified technical gaps</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.learningResources.map((res, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">
                {res.type}
              </span>
              <h3 className="font-bold text-slate-900 text-sm">{res.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{res.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
