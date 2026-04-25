import React from 'react';

export const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-surface-300/50 rounded-xl animate-pulse ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="glass-card p-6 space-y-4">
    <SkeletonPulse className="h-4 w-1/3" />
    <SkeletonPulse className="h-8 w-1/2" />
    <SkeletonPulse className="h-3 w-2/3" />
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="glass-card p-6 space-y-4">
    <SkeletonPulse className="h-5 w-1/3" />
    <SkeletonPulse className="h-48 w-full" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="glass-card p-6 space-y-3">
    <SkeletonPulse className="h-5 w-1/4 mb-4" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <SkeletonPulse className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-3 w-2/3" />
          <SkeletonPulse className="h-3 w-1/3" />
        </div>
        <SkeletonPulse className="h-6 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <SkeletonPulse className="h-8 w-64" />
    <SkeletonPulse className="h-4 w-96" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SkeletonChart />
      <div className="lg:col-span-2"><SkeletonChart /></div>
    </div>
  </div>
);
