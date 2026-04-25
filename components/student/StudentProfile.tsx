import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, GraduationCap, Save, Loader2 } from 'lucide-react';
import { apiGetProfile, apiUpdateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../shared/Toast';
import { SkeletonCard, SkeletonPulse } from '../shared/Skeleton';

const StudentProfile: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', location: '',
    education: [{ title: '', school: '', degree: '', spec: '', year: '', gpa: '' }],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGetProfile();
        const d = res.data || {};
        setForm({
          name: d.name || user?.name || '',
          phone: d.phone || '',
          location: d.location || '',
          education: d.education?.length > 0 ? d.education : [{ title: '', school: '', degree: '', spec: '', year: '', gpa: '' }],
        });
      } catch {}
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiUpdateProfile(form);
      addToast('success', 'Profile saved successfully');
    } catch (err: any) { addToast('error', err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const updateEdu = (i: number, field: string, value: string) => {
    const edu = [...form.education];
    (edu[i] as any)[field] = value;
    setForm({ ...form, education: edu });
  };

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <SkeletonPulse className="h-8 w-40" />
      <SkeletonCard /> <SkeletonCard />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal and academic information.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field pl-11 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-field pl-11 text-sm" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="input-field pl-11 text-sm" placeholder="City, Country" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Education</h2>
        {form.education.map((edu, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-surface-200/50 rounded-xl border border-border">
            <input type="text" value={edu.school} onChange={e => updateEdu(i, 'school', e.target.value)}
              className="input-field text-sm" placeholder="University/Institution" />
            <input type="text" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)}
              className="input-field text-sm" placeholder="Degree (e.g. B.Tech)" />
            <input type="text" value={edu.spec} onChange={e => updateEdu(i, 'spec', e.target.value)}
              className="input-field text-sm" placeholder="Specialization" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)}
                className="input-field text-sm" placeholder="Year" />
              <input type="text" value={edu.gpa} onChange={e => updateEdu(i, 'gpa', e.target.value)}
                className="input-field text-sm" placeholder="GPA" />
            </div>
          </div>
        ))}
        <button onClick={() => setForm({ ...form, education: [...form.education, { title: '', school: '', degree: '', spec: '', year: '', gpa: '' }] })}
          className="text-sm text-primary-400 font-semibold hover:underline">+ Add Education</button>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
};

export default StudentProfile;