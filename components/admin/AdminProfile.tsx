import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Save, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { apiUpdateProfile, apiChangePassword } from '../../services/api';
import { useToast } from '../shared/Toast';

const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Editable profile fields
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) { addToast('error', 'Name is required.'); return; }
    setSaving(true);
    try {
      await apiUpdateProfile({ name: name.trim() });
      addToast('success', 'Profile updated successfully.');
    } catch (err: any) { addToast('error', err.message || 'Update failed.'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      addToast('error', 'Please fill in all password fields.'); return;
    }
    if (newPassword.length < 6) {
      addToast('error', 'New password must be at least 6 characters.'); return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast('error', 'New passwords do not match.'); return;
    }

    setChangingPassword(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      addToast('success', 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordSection(false);
    } catch (err: any) { addToast('error', err.message || 'Password change failed.'); }
    finally { setChangingPassword(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Admin Profile</h1>
        <p className="text-gray-500 mt-1">Manage your administrator account details.</p>
      </div>

      {/* Profile Info */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-lg font-bold text-primary-300">
            {(name?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-200">{name || 'Admin'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="input-field pl-11 text-sm" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" value={user?.email || ''} readOnly className="input-field text-sm opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Role</label>
            <input type="text" value="Administrator" readOnly className="input-field text-sm opacity-60 cursor-not-allowed" />
          </div>
        </div>
        <button onClick={handleSaveProfile} disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60 text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Password Change */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Security</h2>
          {!showPasswordSection && (
            <button onClick={() => setShowPasswordSection(true)}
              className="text-sm text-primary-400 font-semibold hover:underline flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Change Password
            </button>
          )}
        </div>

        {showPasswordSection && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPasswords ? 'text' : 'password'} value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="input-field pl-11 pr-11 text-sm" placeholder="Enter current password" />
                <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">New Password</label>
                <input type={showPasswords ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input-field text-sm" placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
                <input type={showPasswords ? 'text' : 'password'} value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className="input-field text-sm" placeholder="Repeat new password" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleChangePassword} disabled={changingPassword}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {changingPassword ? 'Changing...' : 'Update Password'}
              </button>
              <button onClick={() => { setShowPasswordSection(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}
                className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
