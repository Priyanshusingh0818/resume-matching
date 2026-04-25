import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Target, BarChart3, Briefcase, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { apiGetAnalytics } from '../../services/api';
import { AnalyticsData, ScoreBreakdown } from '../../types';
import StatCard from '../shared/StatCard';
import { SkeletonPage } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGetAnalytics();
        setData(res.data);
      } catch (err: any) { setError(err.message); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  if (isLoading) return <SkeletonPage />;

  if (error) return (
    <div className="glass-card p-10 text-center">
      <p className="text-red-400 font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary mt-4 text-sm">Retry</button>
    </div>
  );

  const d = data!;
  const bk = d.scoreBreakdown;

  const breakdownDims = [
    { label: 'Skills', value: bk.skills, color: '#7C3AED' },
    { label: 'Experience', value: bk.experience, color: '#6366F1' },
    { label: 'Education', value: bk.education, color: '#8B5CF6' },
    { label: 'Keywords', value: bk.keywords, color: '#A78BFA' },
    { label: 'Quality', value: bk.quality, color: '#C4B5FD' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Welcome back, {user?.name?.split(' ')[0] || 'there'}</h1>
        <p className="text-gray-500 mt-1">Your AI-powered career intelligence at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="ATS Score" value={`${d.resumeScore}`} icon={<Zap className="w-5 h-5 text-primary-400" />} subtitle="Your resume score" />
        <StatCard label="Avg Match" value={`${d.averageScore}%`} icon={<Target className="w-5 h-5 text-primary-400" />} subtitle="Across all jobs" />
        <StatCard label="Jobs Matched" value={`${d.jobsMatched}`} icon={<Briefcase className="w-5 h-5 text-primary-400" />} subtitle={`of ${d.totalJobs} available`} />
        <StatCard label="Skill Gaps" value={`${d.skillGap.length}`} icon={<TrendingUp className="w-5 h-5 text-primary-400" />} subtitle="Skills to improve" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Breakdown */}
        <div className="lg:col-span-5 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Average Score Breakdown</h2>
          {d.averageScore > 0 ? (
            <div className="space-y-4">
              {breakdownDims.map(dim => (
                <div key={dim.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-300">{dim.label}</span>
                    <span className="text-sm font-bold text-gray-200">{dim.value}%</span>
                  </div>
                  <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${dim.value}%`, backgroundColor: dim.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No score data" description="Upload a resume and generate matches to see your score breakdown." />
          )}
        </div>

        {/* Top Matched Jobs */}
        <div className="lg:col-span-7 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Top Matched Roles</h2>
          {d.jobRoleData.length > 0 ? (
            <div className="space-y-3">
              {d.jobRoleData.map((job, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-surface-200/50 rounded-xl border border-border hover:border-primary/20 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${job.color}20`, color: job.color }}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">{job.role}</p>
                    <p className="text-xs text-gray-500">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold" style={{ color: job.color }}>{job.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No matches yet" description="Generate job matches to see your top roles." action={{ label: 'Go to Matching', onClick: () => navigate('/student/job-matching') }} />
          )}
        </div>
      </div>

      {/* Skill Gap + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Skills in Demand (Missing from Your Profile)</h2>
          {d.skillGap.length > 0 ? (
            <div className="space-y-3">
              {d.skillGap.slice(0, 6).map(skill => {
                const maxCount = d.skillGap[0].count;
                const pct = maxCount > 0 ? (skill.count / maxCount) * 100 : 0;
                return (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-300">{skill.name}</span>
                      <span className="text-gray-500">{skill.count} jobs</span>
                    </div>
                    <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/70 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Skill gap clear!" description="You match well with the requirements. Generate matches to refresh data." />
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          {[
            { label: 'Analyze Resume', desc: 'Upload and score your PDF', path: '/student/resume-analyzer', icon: FileText },
            { label: 'Match with Jobs', desc: 'Find your best-fit roles', path: '/student/job-matching', icon: Target },
            { label: 'View Analytics', desc: 'Detailed scoring insights', path: '/student/analytics', icon: BarChart3 },
          ].map(action => {
            const Icon = action.icon;
            return (
              <button key={action.path} onClick={() => navigate(action.path)}
                className="w-full glass-card p-5 flex items-center gap-4 hover:border-primary/30 transition-all group text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-200">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
