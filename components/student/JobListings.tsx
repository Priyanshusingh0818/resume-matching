import React, { useState, useEffect } from 'react';
import { Briefcase, Search, MapPin, Clock, ChevronRight, X } from 'lucide-react';
import { apiGetJobs } from '../../services/api';
import { Job } from '../../types';
import { SkeletonPage } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';

const JobListings: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGetJobs();
        setJobs(res.data || []);
      } catch {}
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Browse Jobs</h1>
          <p className="text-gray-500 mt-1">{jobs.length} positions available</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-11 text-sm" placeholder="Search jobs..." aria-label="Search jobs" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card">
          <EmptyState icon={<Briefcase className="w-8 h-8 text-gray-500" />}
            title={searchQuery ? 'No results' : 'No jobs posted'}
            description={searchQuery ? 'Try a different search term.' : 'Jobs will appear here once posted by an admin.'} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(job => {
            let skills: string[] = [];
            try { skills = typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills; } catch {}
            return (
              <div key={job.id} className="glass-card p-6 hover:border-primary/20 transition-all cursor-pointer" onClick={() => setSelectedJob(job)}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-200 truncate">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {skills.slice(0, 5).map(s => <span key={s} className="badge-info text-[10px]">{s}</span>)}
                  {skills.length > 5 && <span className="badge-info text-[10px]">+{skills.length - 5}</span>}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedJob(null)}>
          <div className="bg-surface-50 rounded-2xl border border-border p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-200">{selectedJob.title}</h2>
                <p className="text-sm text-gray-500">{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-surface-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {(typeof selectedJob.skills === 'string' ? JSON.parse(selectedJob.skills) : selectedJob.skills).map((s: string) => (
                  <span key={s} className="badge-info text-xs">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
            </div>
            <button onClick={() => setSelectedJob(null)} className="btn-secondary text-sm mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListings;