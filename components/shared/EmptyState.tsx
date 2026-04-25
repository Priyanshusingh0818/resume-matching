import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mb-5">
      {icon || <FileX className="w-8 h-8 text-gray-500" />}
    </div>
    <h3 className="text-lg font-bold text-gray-200 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
    {action && (
      <button onClick={action.onClick} className="btn-primary text-sm">
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
