import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Briefcase, FileText, Target, BarChart3,
  User, Settings, LogOut, ChevronLeft, Sparkles
} from 'lucide-react';

interface SidebarProps { userType: 'student' | 'admin'; }

const Sidebar: React.FC<SidebarProps> = ({ userType }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/resume-analyzer', label: 'Resume Analyzer', icon: FileText },
    { path: '/student/job-matching', label: 'Job Matching', icon: Target },
    { path: '/student/jobs', label: 'Browse Jobs', icon: Briefcase },
    { path: '/student/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/student/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/job-posting', label: 'Job Posting', icon: Briefcase },
    { path: '/admin/resume-pool', label: 'Candidate Pool', icon: FileText },
    { path: '/admin/configuration', label: 'Settings', icon: Settings },
    { path: '/admin/profile', label: 'Profile', icon: User },
  ];

  const links = userType === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 min-h-screen bg-surface-50 border-r border-border flex flex-col shrink-0" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-100">SmartMatch</h1>
            <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-widest">AI Platform</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                isActive
                  ? 'bg-primary/15 text-primary-300 border border-primary/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-[18px] h-[18px]" />
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-300">
            {(user?.name?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-200 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
