import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-surface-50/80 backdrop-blur-lg flex items-center justify-between px-8 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {user?.userType === 'admin' ? 'Admin Portal' : 'Student Portal'}
        </span>
      </div>
    </header>
  );
};

export default Header;
