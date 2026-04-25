import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ChevronRight, Loader2, AlertCircle, Sparkles, Shield, Eye, EyeOff } from 'lucide-react';
import { apiRegister } from '../../services/api';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Determine role from URL
  const path = window.location.pathname;
  const role = path.includes('admin') ? 'admin' : 'student';
  const loginPath = role === 'admin' ? '/admin/login' : '/student/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (role === 'admin' && !inviteCode.trim()) {
      setError('Admin invite code is required.'); return;
    }

    setLoading(true);
    try {
      await apiRegister(name.trim(), email.trim(), password, role, role === 'admin' ? inviteCode.trim() : undefined);
      navigate(loginPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/15 rounded-2xl border border-primary/20 mb-4">
            <Sparkles className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100">Create Account</h1>
          <p className="text-gray-500">{role === 'admin' ? 'Set up recruiter access' : 'Join the SmartMatch platform'}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={loading}
                  className="input-field pl-11" placeholder="John Doe" required />
              </div>
            </div>
            <div>
              <label htmlFor="reg-email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading}
                  className="input-field pl-11" placeholder="name@email.com" required autoComplete="email" />
              </div>
            </div>
            <div>
              <label htmlFor="reg-password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} disabled={loading}
                  className="input-field pl-11 pr-11" placeholder="Min 6 characters" required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-confirm" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input id="reg-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading}
                  className="input-field pl-11" placeholder="••••••••" required autoComplete="new-password" />
              </div>
            </div>

            {role === 'admin' && (
              <div>
                <label htmlFor="reg-invite" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Admin Invite Code</label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input id="reg-invite" type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} disabled={loading}
                    className="input-field pl-11" placeholder="Enter invite code" required />
                </div>
                <p className="text-xs text-gray-600 mt-1.5">Contact your organization admin for the invite code.</p>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating Account…</> : <>Create Account <ChevronRight className="w-5 h-5" /></>}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Already have an account? <Link to={loginPath} className="text-primary-400 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
