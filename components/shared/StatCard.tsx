import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, subtitle }) => (
  <div className="stat-card flex items-center gap-5" id={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-gray-100 truncate">{value}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export default StatCard;
