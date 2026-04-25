import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Loader2, X, FileText } from 'lucide-react';
import { apiGetAdminResumes, apiUpdateMatchStatus, apiGetMatchInsights, apiExportCandidatesCSV } from '../../services/api';
import { AdminCandidate } from '../../types';
import { useToast } from '../shared/Toast';
import { SkeletonTable } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';

const ResumePool: React.FC = () => {
  const { addToast } = useToast();
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [insightModal, setInsightModal] = useState<{id: number; insight: string} | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGetAdminResumes();
        const data = res.data || [];
        setCandidates(data);
        
        // Notify admin of new pending applications
        const pendingCount = data.filter((c: AdminCandidate) => c.status === 'Pending').length;
        if (pendingCount > 0) {
          addToast('success', `You have ${pendingCount} new pending application${pendingCount !== 1 ? 's' : ''}`);
        }
      } catch (err: any) { addToast('error', err.message); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiUpdateMatchStatus(id, status);
      setCandidates(c => c.map(x => x.id === id ? { ...x, status } : x));
      addToast('success', `Status → ${status}`);
    } catch { addToast('error', 'Update failed'); }
  };

  const viewInsight = async (id: number) => {
    setInsightLoading(true);
    try {
      const res = await apiGetMatchInsights(id);
      setInsightModal({ id, insight: (res.data as any)?.insight || (res as any).insight || 'No insight.' });
    } catch { setInsightModal({ id, insight: 'Failed to load.' }); }
    finally { setInsightLoading(false); }
  };

  const handleExport = async () => {
    try {
      const blob = await apiExportCandidatesCSV(statusFilter);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'candidates.csv'; a.click();
      addToast('success', 'CSV exported');
    } catch { addToast('error', 'Export failed'); }
  };

  const filtered = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status Filter Logic: 'active' hides Rejected.
    let matchStatus = true;
    if (statusFilter === 'active') {
      matchStatus = c.status !== 'Rejected';
    } else if (statusFilter !== 'all') {
      matchStatus = c.status === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  if (isLoading) return <div className="max-w-6xl mx-auto"><SkeletonTable rows={6} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Candidate Pool</h1>
          <p className="text-gray-500 mt-1">{candidates.length} candidates total</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-10 text-sm w-56" placeholder="Search..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="input-field text-sm w-36" aria-label="Filter by status">
            <option value="active">Active (No Rejected)</option>
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card">
          <EmptyState icon={<FileText className="w-8 h-8 text-gray-500" />} title="No candidates found" description="No candidates match your search/filter criteria." />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Skills</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-surface-200/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-200">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.university}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{c.role}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-base font-bold ${c.score >= 80 ? 'text-emerald-400' : c.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {c.score}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">{c.skillsScore}%</td>
                    <td className="py-3 px-4 text-center">
                      <select value={c.status} onChange={e => handleStatusChange(c.id, e.target.value)}
                        className="bg-surface-200 border border-border rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary/50">
                        {['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => viewInsight(c.id)} className="p-2 text-gray-500 hover:text-primary-400 hover:bg-primary/10 rounded-lg transition-colors" title="AI Insight">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {insightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInsightModal(null)}>
          <div className="bg-surface-50 rounded-2xl border border-border p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">AI Insight</h3>
            {insightLoading ? (
              <div className="flex items-center gap-3"><Loader2 className="w-4 h-4 animate-spin text-primary-400" /><span className="text-sm text-gray-400">Loading...</span></div>
            ) : (
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{insightModal.insight}</p>
            )}
            <button onClick={() => setInsightModal(null)} className="btn-secondary text-sm mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePool;
