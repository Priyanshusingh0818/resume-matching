import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, User, Home, Settings } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'resume-analyzer': 'Resume Analyzer',
  'job-matching': 'Job Matching',
  jobs: 'Browse Jobs',
  analytics: 'Analytics',
  profile: 'Profile',
  'job-posting': 'Job Posting',
  'resume-pool': 'Candidate Pool',
  configuration: 'Settings',
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Build breadcrumbs
  const segments = location.pathname.split('/').filter(Boolean);
  const portal = segments[0] || 'student';
  const page = segments[1] || 'dashboard';
  const pageLabel = ROUTE_LABELS[page] || page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <header className="h-16 border-b border-border bg-surface-50/80 backdrop-blur-lg flex items-center justify-between px-6 md:px-8 shrink-0">
      {/* Breadcrumbs */}
      <nav className="hidden sm:flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <button onClick={() => navigate(`/${portal}/dashboard`)} className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" />
          {portal === 'admin' ? 'Admin' : 'Student'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-gray-200 font-medium">{pageLabel}</span>
      </nav>

      {/* Mobile: just page title */}
      <span className="sm:hidden text-sm font-semibold text-gray-200 ml-12">{pageLabel}</span>

      {/* Right side: portal badge + avatar dropdown */}
      <div className="flex items-center gap-4">
        <span className="hidden md:inline-block text-[10px] font-bold text-primary-400 uppercase tracking-widest px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
          {portal === 'admin' ? 'Admin' : 'Student'}
        </span>

        {/* Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary-300 hover:bg-primary/25 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="User menu"
          >
            {(user?.name?.[0] || '?').toUpperCase()}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-50 border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button onClick={() => { navigate(`/${portal}/profile`); setDropdownOpen(false); }}
                  className="w-full px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-200/50 flex items-center gap-3 transition-colors">
                  <User className="w-4 h-4" /> Profile
                </button>
                {portal === 'admin' && (
                  <button onClick={() => { navigate('/admin/configuration'); setDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-200/50 flex items-center gap-3 transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                )}
                <button onClick={() => { logout(); setDropdownOpen(false); }}
                  className="w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
