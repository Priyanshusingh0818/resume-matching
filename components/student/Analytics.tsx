import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { apiGetAnalytics } from '../../services/api';
import { AnalyticsData } from '../../types';
import StatCard from '../shared/StatCard';
import { SkeletonPage } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';

const chartTheme = {
  bg: 'transparent',
  text: '#94A3B8',
  grid: '#2D2D4A',
  primary: '#7C3AED',
  accent: '#A78BFA',
};

const Analytics: React.FC = () => {
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
      <p className="text-red-400">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary mt-4 text-sm">Retry</button>
    </div>
  );

  const d = data!;
  const bk = d.scoreBreakdown;

  const radarData = [
    { dimension: 'Skills', value: bk.skills },
    { dimension: 'Experience', value: bk.experience },
    { dimension: 'Education', value: bk.education },
    { dimension: 'Keywords', value: bk.keywords },
    { dimension: 'Quality', value: bk.quality },
  ];

  const pieData = [
    { name: 'Matched', value: d.averageScore, color: '#7C3AED' },
    { name: 'Gap', value: Math.max(0, 100 - d.averageScore), color: '#1E1E35' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Analytics</h1>
        <p className="text-gray-500 mt-1">Real-time insights computed from your resume and match data.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Resume Score" value={`${d.resumeScore}`} icon={<Zap className="w-5 h-5 text-primary-400" />} subtitle="Deterministic ATS" />
        <StatCard label="Average Match" value={`${d.averageScore}%`} icon={<Target className="w-5 h-5 text-primary-400" />} />
        <StatCard label="Jobs Matched" value={`${d.jobsMatched}`} icon={<BarChart3 className="w-5 h-5 text-primary-400" />} subtitle={`of ${d.totalJobs}`} />
        <StatCard label="Skill Gaps" value={`${d.skillGap.length}`} icon={<TrendingUp className="w-5 h-5 text-primary-400" />} subtitle="Missing in-demand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-5 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Score Dimensions</h2>
          {d.averageScore > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={chartTheme.grid} />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: chartTheme.text, fontSize: 10 }} />
                <Radar dataKey="value" stroke={chartTheme.primary} fill={chartTheme.primary} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data" description="Generate matches to see your score radar." />
          )}
        </div>

        {/* Alignment Ring + Top Matches */}
        <div className="lg:col-span-7 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Top Matched Roles</h2>
          {d.jobRoleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={d.jobRoleData} layout="vertical" barSize={18}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: chartTheme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="role" type="category" width={140} tick={{ fill: chartTheme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D4A', borderRadius: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} fill={chartTheme.primary} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No matches" description="Generate job matches to see role alignment." />
          )}
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Skill Gap Analysis</h2>
        <p className="text-sm text-gray-500 mb-5">Skills that appear in matched job listings but are missing from your resume.</p>
        {d.skillGap.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {d.skillGap.map(skill => {
              const maxC = d.skillGap[0].count;
              const pct = maxC > 0 ? (skill.count / maxC) * 100 : 0;
              return (
                <div key={skill.name} className="flex items-center gap-4 p-3 bg-surface-200/50 rounded-xl border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-300 truncate">{skill.name}</span>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{skill.count} jobs</span>
                    </div>
                    <div className="h-1 bg-surface-300 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No skill gaps detected" description="Your skills cover the requirements well, or no matches have been generated yet." />
        )}
      </div>
    </div>
  );
};

export default Analytics;
