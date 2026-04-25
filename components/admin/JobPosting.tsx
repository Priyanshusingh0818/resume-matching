import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Briefcase, X, AlertCircle, Building2 } from 'lucide-react';
import { apiGetJobs, apiCreateJob, apiDeleteJob } from '../../services/api';
import { Job } from '../../types';
import { useToast } from '../shared/Toast';
import { useAuth } from '../../context/AuthContext';
import { SkeletonPage } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';

const JobPosting: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const companyName = user?.name || 'Your Company';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', skillInput: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    try {
      const res = await apiGetJobs();
      setJobs(res.data || []);
    } catch {}
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadJobs(); }, []);

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setForm({ ...form, skillInput: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || skills.length === 0) {
      setError('Title, description, and at least one skill are required.'); return;
    }
    setSaving(true);
    try {
      await apiCreateJob({ title: form.title, company: companyName, description: form.description, skills });
      addToast('success', 'Job posted successfully');
      setForm({ title: '', description: '', skillInput: '' });
      setSkills([]);
      setShowForm(false);
      loadJobs();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteJob(id);
      setJobs(jobs.filter(j => j.id !== id));
      addToast('success', 'Job removed');
    } catch { addToast('error', 'Delete failed'); }
  };

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Job Posting</h1>
          <p className="text-gray-500 mt-1">{jobs.length} active positions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 animate-fade-in">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Job Title</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-field text-sm" placeholder="e.g. Senior React Developer" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Company</label>
              <div className="input-field text-sm flex items-center gap-2 opacity-70 cursor-not-allowed">
                <Building2 className="w-4 h-4 text-primary-400" />
                <span>{companyName}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field text-sm min-h-[100px] resize-y" placeholder="Job description..." required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Required Skills</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={form.skillInput} onChange={e => setForm({ ...form, skillInput: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                className="input-field text-sm flex-1" placeholder="Type skill + Enter" />
              <button type="button" onClick={addSkill} className="btn-secondary text-sm px-4">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="badge-info flex items-center gap-1">
                  {s} <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Posting...' : 'Post Job'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      {jobs.length === 0 ? (
        <div className="glass-card">
          <EmptyState icon={<Briefcase className="w-8 h-8 text-gray-500" />} title="No jobs posted" description="Post your first job to start receiving candidate matches." action={{ label: 'Post a Job', onClick: () => setShowForm(true) }} />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            let sk: string[] = [];
            try { sk = typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills; } catch {}
            return (
              <div key={job.id} className="glass-card p-5 flex items-start justify-between gap-4">
                <div className="flex gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-200">{job.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{job.company}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sk.slice(0, 6).map(s => <span key={s} className="badge-info text-[10px]">{s}</span>)}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(job.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0" title="Delete job">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobPosting;