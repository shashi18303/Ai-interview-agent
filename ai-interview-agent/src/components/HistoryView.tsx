import React, { useState, useEffect } from 'react';
import { HistoryRecord } from '../types';
import { 
  History, 
  Search, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Award, 
  FileJson,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { ResultReport } from './ResultReport';

interface HistoryViewProps {
  onStartNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onStartNew }) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete interview record for ${name}?`)) return;
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInterviews = records.length;
  const selectedCount = records.filter((r) => r.status === 'Selected').length;
  const avgScore =
    totalInterviews > 0
      ? Math.round(records.reduce((sum, r) => sum + (r.overallScore || 0), 0) / totalInterviews)
      : 0;

  if (selectedRecord && selectedRecord.data.finalReport) {
    return (
      <div className="space-y-4">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <button
            onClick={() => setSelectedRecord(null)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-2 border border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to History Table</span>
          </button>
        </div>

        <ResultReport
          candidateName={selectedRecord.data.candidateName}
          role={selectedRecord.data.role}
          experience={selectedRecord.data.experience}
          evaluations={selectedRecord.data.evaluations}
          report={selectedRecord.data.finalReport}
          onRetake={onStartNew}
          sessionId={selectedRecord.id}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">SQLite Interview History Database</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Persisted candidate screening transcripts stored in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">/data/interview.db.json</code>
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 shadow-md transition-all self-start sm:self-auto"
        >
          + Start New Interview
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Interviews</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalInterviews}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidates Selected</p>
            <p className="text-2xl font-extrabold text-slate-900">{selectedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Candidate Score</p>
            <p className="text-2xl font-extrabold text-slate-900">{avgScore} <span className="text-xs text-slate-400 font-normal">/ 50</span></p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter candidate transcripts by name or role (e.g. John, Java Developer)..."
          className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading stored records...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No interview records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Target Role</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-900">{rec.candidateName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold">
                        {rec.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      {rec.overallScore} / {rec.maxScore}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        rec.status === 'Selected'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : rec.status === 'Consider'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all inline-flex items-center gap-1"
                        title="View Full Report"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      <a
                        href={`/api/export/${rec.id}`}
                        download
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1"
                        title="Download transcript.json"
                      >
                        <FileJson className="w-3.5 h-3.5 text-cyan-600" /> Export
                      </a>

                      <button
                        onClick={() => handleDelete(rec.id, rec.candidateName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all inline-flex items-center"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
