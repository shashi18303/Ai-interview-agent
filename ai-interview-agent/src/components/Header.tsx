import React from 'react';
import { Bot, History, Sparkles, FileText, PlusCircle, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'new' | 'history' | 'sample';
  setActiveTab: (tab: 'new' | 'history' | 'sample') => void;
  inActiveInterview?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, inActiveInterview }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => !inActiveInterview && setActiveTab('new')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white">AI Interview Agent</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> Gemini 3.6
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Automated Technical Screening & Candidate Evaluation</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            id="nav-new-interview-btn"
            onClick={() => setActiveTab('new')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'new'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Interview</span>
            <span className="sm:hidden">New</span>
          </button>

          <button
            id="nav-history-btn"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>

          <button
            id="nav-sample-transcript-btn"
            onClick={() => setActiveTab('sample')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'sample'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Sample Report</span>
            <span className="md:hidden">Sample</span>
          </button>

          <a
            id="nav-download-zip-btn"
            href="/api/download-zip"
            download
            className="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30"
            title="Download full project source code as .ZIP archive"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Download ZIP</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
