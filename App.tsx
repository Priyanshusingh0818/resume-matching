import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/shared/Toast';

// Auth
import StudentLogin from './components/auth/StudentLogin';
import AdminLogin from './components/auth/AdminLogin';
import Register from './components/auth/Register';

// Student
import Dashboard from './components/student/Dashboard';
import ResumeAnalyzer from './components/student/ResumeAnalyzer';
import JobMatching from './components/student/JobMatching';
import JobListings from './components/student/JobListings';
import Analytics from './components/student/Analytics';
import StudentProfile from './components/student/StudentProfile';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';
import JobPosting from './components/admin/JobPosting';
import ResumePool from './components/admin/ResumePool';
import AdminProfile from './components/admin/AdminProfile';
import Configuration from './components/admin/Configuration';
import LandingPage from './components/LandingPage';

// Shared
import Sidebar from './components/shared/Sidebar';
import Header from './components/shared/Header';

const ProtectedRoute: React.FC<{ allowedRole: string }> = ({ allowedRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to={`/${allowedRole}/login`} replace />;
  if (user?.userType !== allowedRole) return <Navigate to={`/${user?.userType}/dashboard`} replace />;

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar userType={allowedRole as 'student' | 'admin'} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/register" element={<Register />} />
          <Route path="/admin/register" element={<Register />} />

          {/* Student */}
          <Route element={<ProtectedRoute allowedRole="student" />}>
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/student/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/student/job-matching" element={<JobMatching />} />
            <Route path="/student/jobs" element={<JobListings />} />
            <Route path="/student/analytics" element={<Analytics />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/job-posting" element={<JobPosting />} />
            <Route path="/admin/resume-pool" element={<ResumePool />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/configuration" element={<Configuration />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </Router>
);

export default App;
