import {
  ResumeAnalysis, JobMatchResult, AnalyticsData, AdminStats, Job,
  JobFitExplanation, ResumeImprovements, AdminCandidate,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options: RequestInit = {}): Promise<{ success: boolean; data: T; message?: string }> {
  const headers: Record<string, string> = { ...getAuthHeaders() };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message || json.message || `Request failed (${res.status})`);
  }

  return json;
}

// Auth
export const apiRegister = (name: string, email: string, password: string, role: string) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });

export const apiLogin = (email: string, password: string) =>
  request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

// Resume
export const apiUploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  return request<ResumeAnalysis>('/resume/upload', { method: 'POST', body: formData });
};

export const apiGetResume = () => request<ResumeAnalysis | null>('/resume');

export const apiGetResumeImprovements = () => request<ResumeImprovements>('/resume/improvements');

// Jobs
export const apiGetJobs = () => request<Job[]>('/jobs');

export const apiCreateJob = (job: { title: string; description: string; skills: string[]; company: string }) =>
  request('/jobs', { method: 'POST', body: JSON.stringify(job) });

export const apiDeleteJob = (id: number) => request(`/jobs/${id}`, { method: 'DELETE' });

// Matches
export const apiGenerateMatches = () => request<JobMatchResult[]>('/matches/generate');

export const apiGetJobFitExplanation = (matchId: number) =>
  request<JobFitExplanation>(`/matches/${matchId}/explanation`);

// Analytics
export const apiGetAnalytics = () => request<AnalyticsData>('/analytics');

// Admin
export const apiGetAdminStats = () => request<AdminStats>('/admin/stats');

export const apiGetAdminResumes = () => request<AdminCandidate[]>('/admin/resumes');

export const apiUpdateMatchStatus = (matchId: number, status: string) =>
  request(`/admin/matches/${matchId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const apiGetMatchInsights = (matchId: number) => request<{ insight: string }>(`/admin/matches/${matchId}/insights`);

export const apiExportCandidatesCSV = async (status?: string) => {
  const headers = getAuthHeaders();
  const url = status && status !== 'all' ? `${API_BASE}/admin/export/candidates?status=${status}` : `${API_BASE}/admin/export/candidates`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

// Profile
export const apiGetProfile = () => request<any>('/profile');

export const apiUpdateProfile = (data: any) =>
  request('/profile', { method: 'PUT', body: JSON.stringify(data) });

// re-export types
export type { ResumeAnalysis as AIResumeAnalysis, JobMatchResult, AnalyticsData, AdminStats };
