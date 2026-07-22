import React, { useState, useEffect, useRef } from 'react';
import { InterviewQuestion } from '../types';
import { 
  Clock, 
  Mic, 
  MicOff, 
  Send, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  HelpCircle,
  Pause,
  Play
} from 'lucide-react';

interface InterviewScreenProps {
  candidateName: string;
  role: string;
  question: InterviewQuestion;
  currentIndex: number;
  totalQuestions: number;
  timerSecondsPerQuestion: number;
  onSubmitAnswer: (answer: string) => void;
  isEvaluating: boolean;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  candidateName,
  role,
  question,
  currentIndex,
  totalQuestions,
  timerSecondsPerQuestion,
  onSubmitAnswer,
  isEvaluating
}) => {
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(timerSecondsPerQuestion);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if browser supports it
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setAnswer((prev) => {
            // Append if listening continuously
            if (prev.endsWith(' ') || prev.length === 0) {
              return prev + transcript;
            }
            return prev + ' ' + transcript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    setTimeLeft(timerSecondsPerQuestion);
    setIsTimerPaused(false);
    setAnswer('');
  }, [question, timerSecondsPerQuestion]);

  useEffect(() => {
    if (timerSecondsPerQuestion <= 0 || isTimerPaused || isEvaluating) return;

    if (timeLeft <= 0) {
      // Auto-submit on time expiry
      onSubmitAnswer(answer.trim() || '(Timed out without answer)');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerPaused, timerSecondsPerQuestion, isEvaluating]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting speech recognition:', e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onSubmitAnswer(answer.trim() || '(Candidate provided empty answer)');
  };

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Difficulty badge colors
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Hard':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Scenario Based':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-lg">{role} Interview</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600">
                Candidate: {candidateName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>

          {/* Timer Gauge */}
          {timerSecondsPerQuestion > 0 && (
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <Clock className={`w-5 h-5 ${timeLeft <= 30 ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`} />
              <div>
                <div className={`text-base font-extrabold font-mono ${timeLeft <= 30 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Remaining</p>
              </div>

              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all"
                title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
              >
                {isTimerPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar Dots */}
        <div className="flex items-center space-x-2 pt-2">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full transition-all ${
                idx < currentIndex
                  ? 'bg-emerald-500'
                  : idx === currentIndex
                  ? 'bg-indigo-600 ring-2 ring-indigo-300'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyBadge(question.difficulty)}`}>
            {question.difficulty} Level
          </span>

          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            Focus: <strong className="text-slate-800">{question.focus}</strong>
          </span>
        </div>

        {/* Question Text */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {question.question}
          </h2>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="candidate-answer-textarea" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Your Answer</span>
                {isListening && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span> Recording Speech...
                  </span>
                )}
              </label>

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop Voice Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Answer with Voice (Speech to Text)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <textarea
              id="candidate-answer-textarea"
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type or dictate your technical explanation here. Include key concepts, edge cases, and code examples if applicable..."
              className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Words: {answer.trim() ? answer.trim().split(/\s+/).length : 0} | Characters: {answer.length}</span>

            <button
              type="button"
              onClick={() => setAnswer('')}
              className="text-slate-400 hover:text-slate-600 hover:underline text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear Answer
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Gemini AI will evaluate accuracy, completeness, and score out of 10.
            </p>

            <button
              id="submit-answer-btn"
              type="submit"
              disabled={isEvaluating}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isEvaluating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
