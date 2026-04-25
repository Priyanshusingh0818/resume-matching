import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, TrendingUp, Download, Eye, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { apiGetAdminStats, apiUpdateMatchStatus, apiGetMatchInsights, apiExportCandidatesCSV } from '../../services/api';
import { AdminStats } from '../../types';
import StatCard from '../shared/StatCard';
import { SkeletonPage } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';
import { useToast } from '../shared/Toast';

const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [insightModal, setInsightModal] = useState<{id: number; insight: string} | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGetAdminStats();
        setData(res.data);
      } catch (err: any) { addToast('error', err.message); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleStatusChange = async (matchId: number, status: string) => {
    try {
      await apiUpdateMatchStatus(matchId, status);
      addToast('success', `Status updated to ${status}`);
      setData(d => d ? {
        ...d,
        recentCandidates: d.recentCandidates.map(c => c.id === matchId ? { ...c, status } : c)
      } : d);
    } catch (err: any) { addToast('error', err.message); }
  };

  const handleExport = async () => {
    try {
      const blob = await apiExportCandidatesCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'candidates.csv'; a.click();
      URL.revokeObjectURL(url);
      addToast('success', 'CSV exported successfully');
    } catch { addToast('error', 'Export failed'); }
  };

  const viewInsight = async (matchId: number) => {
    setInsightLoading(true);
    try {
      const res = await apiGetMatchInsights(matchId);
      setInsightModal({ id: matchId, insight: (res.data as any)?.insight || (res as any).insight || 'No insight available.' });
    } catch { setInsightModal({ id: matchId, insight: 'Failed to load insight.' }); }
    finally { setInsightLoading(false); }
  };

  if (isLoading) return <SkeletonPage />;
  if (!data) return <div className="glass-card p-10 text-center text-gray-400">Failed to load admin data.</div>;

  const d = data;
  const statusColors: Record<string, string> = {
    Shortlisted: 'badge-success', Rejected: 'badge-danger', Pending: 'badge-warning', Reviewed: 'badge-info',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform-wide hiring intelligence and candidate management.</p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Students" value={`${d.activeStudents}`} icon={<Users className="w-5 h-5 text-primary-400" />} />
        <StatCard label="Jobs Posted" value={`${d.totalJobsPosted}`} icon={<Briefcase className="w-5 h-5 text-primary-400" />} />
        <StatCard label="Resumes" value={`${d.totalResumes}`} icon={<FileText className="w-5 h-5 text-primary-400" />} />
        <StatCard label="Avg Match" value={`${d.avgMatchScore}%`} icon={<TrendingUp className="w-5 h-5 text-primary-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Job Demand */}
        <div className="lg:col-span-7 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Job Demand Distribution</h2>
          {d.jobDemandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.jobDemandData} barSize={24}>
                <XAxis dataKey="skill" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D4A', borderRadius: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="demand" radius={[6, 6, 0, 0]} fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No jobs posted" description="Post jobs to see demand data." />
          )}
        </div>

        {/* Quality Distribution */}
        <div className="lg:col-span-5 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Match Quality Distribution</h2>
          {d.qualityData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={d.qualityData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                    {d.qualityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D4A', borderRadius: '12px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {d.qualityData.map((q, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: q.color }} />
                    <span className="text-xs text-gray-400">{q.range}: <strong className="text-gray-300">{q.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No match data" description="Match scores will appear here." />
          )}
        </div>
      </div>

      {/* Missing Skills */}
      {d.missingSkillsData.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Platform-wide Skill Gaps</h2>
          <p className="text-xs text-gray-500 mb-4">Skills required by posted jobs that candidates most frequently lack.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {d.missingSkillsData.map(s => (
              <div key={s.name} className="p-3 bg-surface-200/50 rounded-xl border border-border text-center">
                <p className="text-sm font-semibold text-gray-200">{s.name}</p>
                <p className="text-xs text-gray-500 mt-1">{s.count} candidates</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidates Table */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Candidates</h2>
        {d.recentCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {d.recentCandidates.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-surface-200/30 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-gray-200">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.university}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-400">{c.role}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-base font-bold ${c.score >= 80 ? 'text-emerald-400' : c.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {c.score}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <select value={c.status} onChange={e => handleStatusChange(c.id, e.target.value)}
                        className="bg-surface-200 border border-border rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        aria-label={`Change status for ${c.name}`}>
                        {['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button onClick={() => viewInsight(c.id)}
                        className="p-2 text-gray-500 hover:text-primary-400 hover:bg-primary/10 rounded-lg transition-colors" title="View AI Insight">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No candidates yet" description="Candidates will appear once students upload resumes and generate matches." />
        )}
      </div>

      {/* Insight Modal */}
      {insightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInsightModal(null)}>
          <div className="bg-surface-50 rounded-2xl border border-border p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">AI Match Insight</h3>
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

export default AdminDashboard;
