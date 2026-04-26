import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Briefcase, FileText, Target, BarChart3,
  User, Settings, LogOut, Sparkles, Menu, X, Home
} from 'lucide-react';

interface SidebarProps { userType: 'student' | 'admin'; }

const Sidebar: React.FC<SidebarProps> = ({ userType }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/resume-analyzer', label: 'Resume Analyzer', icon: FileText },
    { path: '/student/job-matching', label: 'Job Matching', icon: Target },
    { path: '/student/jobs', label: 'Browse Jobs', icon: Briefcase },
    { path: '/student/my-resumes', label: 'My Resumes', icon: FileText },
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

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-100">SmartMatch</h1>
            <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-widest">AI Platform</p>
          </div>
        </button>
        {/* Mobile close button */}
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-surface-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-surface-50 border border-border rounded-xl shadow-lg text-gray-300 hover:text-white hover:bg-surface-200 transition-all"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-surface-50 border-r border-border flex flex-col transform transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-64 min-h-screen bg-surface-50 border-r border-border flex-col shrink-0"
        role="navigation"
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
