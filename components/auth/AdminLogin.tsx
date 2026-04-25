import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ChevronRight, Shield, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Enter both email and password.'); return; }
    setLoading(true);
    const { error: apiError } = await login(email.trim(), password);
    setLoading(false);
    if (apiError) { setError(apiError); return; }
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/15 rounded-2xl border border-primary/20 mb-4">
            <Shield className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100">Admin Portal</h1>
          <p className="text-gray-500">Manage hiring intelligence</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading}
                  className="input-field pl-11" placeholder="admin@company.com" required autoComplete="email" />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading}
                  className="input-field pl-11" placeholder="••••••••" required autoComplete="current-password" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing In…</> : <>Sign In <ChevronRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">
            Need an admin account? <Link to="/admin/register" className="text-primary-400 font-semibold hover:underline">Register</Link>
          </p>
          <p className="text-gray-600 text-xs">
            Student? <Link to="/student/login" className="text-primary-400 font-semibold hover:underline">Student Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
