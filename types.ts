export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  userType: 'student' | 'admin';
}

export interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  keywords: number;
  quality: number;
}

export interface ResumeAnalysis {
  skills: string[];
  experience: string;
  education: string;
  score: number;
  breakdown: ScoreBreakdown;
  recommendations: string[];
  summary: string;
  experience_entries?: { title: string; company: string; duration: string; description: string }[];
  education_entries?: { degree: string; field: string; school: string; year: string; gpa: string }[];
  certifications?: string[];
  aiUsed: boolean;
}

export interface MatchResult {
  matchId: number;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  breakdown: ScoreBreakdown;
  experienceMatch: boolean;
  educationMatch: boolean;
  is_applied?: boolean;
}

export interface JobMatchResult {
  id: number;
  title: string;
  description: string;
  company: string;
  skills: string[];
  created_at: string;
  match: MatchResult;
}

export interface SkillGapItem {
  name: string;
  count: number;
}

export interface AnalyticsData {
  totalJobs: number;
  jobsMatched: number;
  averageScore: number;
  resumeScore: number;
  skillGap: SkillGapItem[];
  scoreBreakdown: ScoreBreakdown;
  jobRoleData: { role: string; score: number; company: string; color: string }[];
}

export interface AdminStats {
  totalJobsPosted: number;
  totalResumes: number;
  avgMatchScore: number;
  activeStudents: number;
  jobDemandData: { skill: string; demand: number }[];
  qualityData: { range: string; value: number; color: string }[];
  missingSkillsData: { name: string; count: number }[];
  recentCandidates: AdminCandidate[];
}

export interface AdminCandidate {
  id: number;
  name: string;
  role: string;
  score: number;
  skillsScore: number;
  experienceScore: number;
  status: string;
  university: string;
}

export interface JobFitExplanation {
  explanation: string;
  strengths: string[];
  improvements: string[];
  fit_level: 'strong' | 'moderate' | 'weak';
  breakdown: ScoreBreakdown;
}

export interface ResumeImprovements {
  overall_assessment: string;
  critical_improvements: string[];
  skill_suggestions: string[];
  formatting_tips: string[];
  score_potential: number;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  skills: string[];
  company: string;
  created_at: string;
}