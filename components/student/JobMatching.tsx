import React, { useState, useEffect } from 'react';
import { Target, Search, CheckCircle, XCircle, ChevronRight, Briefcase, X, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { apiGenerateMatches, apiGetJobFitExplanation, apiApplyForJob } from '../../services/api';
import { JobMatchResult, JobFitExplanation, ScoreBreakdown } from '../../types';
import { SkeletonPage } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';
import { useToast } from '../shared/Toast';

const BREAKDOWN_KEYS: { key: keyof ScoreBreakdown; label: string; color: string }[] = [
  { key: 'skills', label: 'Skills', color: '#7C3AED' },
  { key: 'experience', label: 'Exp', color: '#6366F1' },
  { key: 'education', label: 'Edu', color: '#8B5CF6' },
  { key: 'keywords', label: 'KW', color: '#A78BFA' },
  { key: 'quality', label: 'Qual', color: '#C4B5FD' },
];

const JobMatching: React.FC = () => {
  const { addToast } = useToast();
  const [minMatch, setMinMatch] = useState(30);
  const [jobs, setJobs] = useState<JobMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobMatchResult | null>(null);
  const [explanation, setExplanation] = useState<JobFitExplanation | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => { fetchMatches(); }, []);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      setError('');
      const { data } = await apiGenerateMatches();
      setJobs(data || []);
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const filteredJobs = jobs.filter(j => j.match.matchScore >= minMatch).sort((a, b) => b.match.matchScore - a.match.matchScore);
  const avgScore = jobs.length > 0 ? Math.round(jobs.reduce((s, j) => s + j.match.matchScore, 0) / jobs.length) : 0;
  const topScr = jobs.length > 0 ? Math.max(...jobs.map(j => j.match.matchScore)) : 0;

  const openDetails = async (job: JobMatchResult) => {
    setSelectedJob(job);
    setExplanation(null);
    setLoadingExplanation(true);
    try {
      const { data } = await apiGetJobFitExplanation(job.match.matchId);
      setExplanation(data);
    } catch { /* AI explanation optional */ }
    finally { setLoadingExplanation(false); }
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = (s: number) => s >= 80 ? 'bg-emerald-500/15 border-emerald-500/20' : s >= 60 ? 'bg-amber-500/15 border-amber-500/20' : 'bg-red-500/15 border-red-500/20';

  if (isLoading) return <SkeletonPage />;

  if (error) return (
    <div className="max-w-3xl mx-auto mt-12 glass-card p-10 text-center space-y-4 animate-fade-in">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
      <h2 className="text-xl font-bold text-gray-200">Unable to generate matches</h2>
      <p className="text-gray-400">{error}</p>
      <button onClick={fetchMatches} className="btn-primary text-sm">Retry</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Job Matching</h1>
          <p className="text-gray-500 mt-1">AI-computed match scores based on 5-dimension analysis.</p>
        </div>
        <div className="glass-card px-6 py-4 min-w-[260px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Score Filter</span>
            <span className="text-sm font-bold text-primary-300">{minMatch}%</span>
          </div>
          <input type="range" min="0" max="100" value={minMatch} onChange={e => setMinMatch(+e.target.value)}
            className="w-full h-1.5 bg-surface-300 rounded-lg cursor-pointer accent-primary" aria-label="Minimum match score filter" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Stats Panel */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
          <div className="glass-card p-6 text-center">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Overall Alignment</h3>
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg className="w-28 h-28 -rotate-90">
                <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="56" cy="56" r="46" fill="none" stroke="#7C3AED" strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 46} strokeDashoffset={(2 * Math.PI * 46) * (1 - avgScore / 100)}
                  strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-100">{avgScore}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/15">
                <p className="text-[10px] font-semibold text-emerald-400 uppercase">Top</p>
                <p className="text-lg font-bold text-emerald-300">{topScr}%</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/15">
                <p className="text-[10px] font-semibold text-primary-400 uppercase">Shown</p>
                <p className="text-lg font-bold text-primary-300">{filteredJobs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="lg:col-span-9 space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="glass-card">
              <EmptyState icon={<Search className="w-8 h-8 text-gray-500" />}
                title="No matches above threshold" description={`Lower the filter below ${minMatch}% to see more roles.`} />
            </div>
          ) : filteredJobs.map(job => (
            <div key={job.id} className="glass-card p-6 hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between mb-5">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-200">{job.title}</h4>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${scoreColor(job.match.matchScore)}`}>
                  {job.match.matchScore}%
                </div>
              </div>

              {/* Mini breakdown */}
              <div className="flex gap-2 mb-4">
                {BREAKDOWN_KEYS.map(d => (
                  <div key={d.key} className="flex-1 text-center p-2 bg-surface-200/50 rounded-lg">
                    <p className="text-[10px] font-semibold text-gray-500">{d.label}</p>
                    <p className="text-sm font-bold text-gray-300">{job.match.breakdown[d.key]}%</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Matched</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.match.matchedSkills.length > 0 ? job.match.matchedSkills.map(s => (
                      <span key={s} className="badge-success text-[10px]">{s}</span>
                    )) : <span className="text-xs text-gray-600 italic">None</span>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Missing</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.match.missingSkills.length > 0 ? job.match.missingSkills.map(s => (
                      <span key={s} className="badge-danger text-[10px]">{s}</span>
                    )) : <span className="text-xs text-emerald-500 italic">All matched!</span>}
                  </div>
                </div>
              </div>

              <button onClick={() => openDetails(job)}
                className="flex items-center gap-2 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                View Details & AI Explanation <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedJob(null)}>
          <div className="bg-surface-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-gray-200">{selectedJob.title}</h2>
                <p className="text-sm text-gray-500">{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-surface-200 transition-colors" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${scoreColor(selectedJob.match.matchScore)}`}>{selectedJob.match.matchScore}%</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${scoreBg(selectedJob.match.matchScore)} ${scoreColor(selectedJob.match.matchScore)}`}>
                  {selectedJob.match.matchScore >= 80 ? 'Strong Fit' : selectedJob.match.matchScore >= 60 ? 'Moderate Fit' : 'Weak Fit'}
                </span>
              </div>

              {/* Breakdown */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Score Breakdown</h3>
                <div className="space-y-2">
                  {BREAKDOWN_KEYS.map(d => (
                    <div key={d.key} className="flex items-center gap-3">
                      <span className="w-14 text-xs text-gray-400 font-medium">{d.label}</span>
                      <div className="flex-1 h-1.5 bg-surface-300 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selectedJob.match.breakdown[d.key]}%`, backgroundColor: d.color }} />
                      </div>
                      <span className="w-10 text-right text-xs font-bold text-gray-300">{selectedJob.match.breakdown[d.key]}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.map(skill => {
                    const matched = selectedJob.match.matchedSkills.includes(skill);
                    return (
                      <span key={skill} className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${matched ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {skill} {matched ? '✓' : '✗'}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* AI Explanation */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" /> AI Explanation
                </h3>
                {loadingExplanation ? (
                  <div className="flex items-center gap-3 p-4 bg-surface-200/50 rounded-xl">
                    <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                    <span className="text-sm text-gray-400">Generating AI explanation...</span>
                  </div>
                ) : explanation ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300 leading-relaxed">{explanation.explanation}</p>
                    {explanation.strengths.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-400 mb-1">Strengths</h4>
                        {explanation.strengths.map((s, i) => <p key={i} className="text-xs text-gray-400 pl-3 border-l-2 border-emerald-500/30 mb-1">{s}</p>)}
                      </div>
                    )}
                    {explanation.improvements.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-amber-400 mb-1">Suggested Improvements</h4>
                        {explanation.improvements.map((s, i) => <p key={i} className="text-xs text-gray-400 pl-3 border-l-2 border-amber-500/30 mb-1">{s}</p>)}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">AI explanation unavailable.</p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Job Description</h3>
                <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setSelectedJob(null)} className="btn-secondary text-sm">Close</button>
              {selectedJob.match.is_applied ? (
                <button disabled className="btn-primary text-sm flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 opacity-100 cursor-not-allowed hover:bg-emerald-500/20">
                  <CheckCircle className="w-4 h-4" /> Applied
                </button>
              ) : (
                <button onClick={async () => {
                  try {
                    await apiApplyForJob(selectedJob.match.matchId);
                    addToast('success', `Application submitted for ${selectedJob.company}`);
                    
                    // Update local state to reflect application
                    const updatedJobs = jobs.map(j => 
                      j.match.matchId === selectedJob.match.matchId 
                        ? { ...j, match: { ...j.match, is_applied: true } } 
                        : j
                    );
                    setJobs(updatedJobs);
                    setSelectedJob({ ...selectedJob, match: { ...selectedJob.match, is_applied: true } });
                  } catch (err: any) {
                    addToast('error', err.message || 'Failed to apply');
                  }
                }}
                  className="btn-primary text-sm flex items-center gap-2">
                  Apply <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatching;
