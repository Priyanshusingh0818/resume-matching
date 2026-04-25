import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Save } from 'lucide-react';

const AdminProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Admin Profile</h1>
        <p className="text-gray-500 mt-1">Your administrator account details.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-lg font-bold text-primary-300">
            {(user?.name?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-200">{user?.name || 'Admin'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Name</label>
            <input type="text" value={user?.name || ''} readOnly className="input-field text-sm opacity-60" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" value={user?.email || ''} readOnly className="input-field text-sm opacity-60" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Role</label>
            <input type="text" value="Administrator" readOnly className="input-field text-sm opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
