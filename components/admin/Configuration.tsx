import React from 'react';
import { Settings } from 'lucide-react';

const Configuration: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
    <div>
      <h1 className="text-3xl font-bold text-gray-100">Configuration</h1>
      <p className="text-gray-500 mt-1">Platform settings and ATS scoring parameters.</p>
    </div>

    <div className="glass-card p-6 space-y-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ATS Scoring Weights</h2>
      <p className="text-sm text-gray-400 leading-relaxed">
        The deterministic ATS scoring engine uses these fixed weights to compute match scores.
        These are optimized for balanced candidate evaluation.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Skills Match', weight: '40%', color: '#7C3AED' },
          { label: 'Experience Relevance', weight: '25%', color: '#6366F1' },
          { label: 'Education Fit', weight: '10%', color: '#8B5CF6' },
          { label: 'Keyword Density', weight: '15%', color: '#A78BFA' },
          { label: 'Resume Quality', weight: '10%', color: '#C4B5FD' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between p-3 bg-surface-200/50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-gray-300">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-gray-200">{item.weight}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="glass-card p-6 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Model</h2>
      <div className="flex items-center justify-between p-3 bg-surface-200/50 rounded-xl border border-border">
        <span className="text-sm text-gray-300">Provider</span>
        <span className="badge-info">Groq API</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-surface-200/50 rounded-xl border border-border">
        <span className="text-sm text-gray-300">Model</span>
        <span className="badge-info">llama-3.3-70b-versatile</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-surface-200/50 rounded-xl border border-border">
        <span className="text-sm text-gray-300">Temperature</span>
        <span className="badge-info">0.1 (deterministic)</span>
      </div>
    </div>
  </div>
);

export default Configuration;
