import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Lightbulb, AlertCircle, Info, Loader2, Sparkles } from 'lucide-react';
import { apiUploadResume, apiGetResume, apiGetResumeImprovements } from '../../services/api';
import { ResumeAnalysis, ScoreBreakdown, ResumeImprovements } from '../../types';
import { SkeletonCard, SkeletonPulse } from '../shared/Skeleton';
import { useToast } from '../shared/Toast';

const BREAKDOWN_LABELS: { key: keyof ScoreBreakdown; label: string; color: string }[] = [
  { key: 'skills', label: 'Skills', color: '#7C3AED' },
  { key: 'experience', label: 'Experience', color: '#6366F1' },
  { key: 'education', label: 'Education', color: '#8B5CF6' },
  { key: 'keywords', label: 'Keywords', color: '#A78BFA' },
  { key: 'quality', label: 'Quality', color: '#C4B5FD' },
];

const ResumeAnalyzer: React.FC = () => {
  const { addToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(true);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [improvements, setImprovements] = useState<ResumeImprovements | null>(null);
  const [loadingImprovements, setLoadingImprovements] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const fetchPrevious = async () => {
      try {
        const { data } = await apiGetResume();
        if (data) setAnalysis(data);
      } catch (err) { console.error('Failed to load previous resume:', err); }
      finally { setIsLoadingPrev(false); }
    };
    fetchPrevious();
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.'); return;
    }
    if (file.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return; }

    setError('');
    setAnalysis(null);
    setImprovements(null);
    setIsUploading(true);

    try {
      const { data } = await apiUploadResume(file);
      setAnalysis(data);
      addToast('success', `Resume analyzed! ATS Score: ${data.score}/100`);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
      addToast('error', 'Resume analysis failed. Please try again.');
    } finally { setIsUploading(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);

  const loadImprovements = async () => {
    setLoadingImprovements(true);
    try {
      const { data } = await apiGetResumeImprovements();
      setImprovements(data);
    } catch (err: any) {
      addToast('error', 'Could not fetch improvements.');
    } finally { setLoadingImprovements(false); }
  };

  const scoreColor = (s: number) => s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444';

  if (isLoadingPrev) return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <SkeletonPulse className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4"><SkeletonCard /><div className="mt-4"><SkeletonCard /></div></div>
        <div className="lg:col-span-8"><SkeletonCard /></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Resume Analyzer</h1>
        <p className="text-gray-500 mt-1">Upload your resume for AI-powered ATS scoring with full breakdown.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`glass-card p-8 text-center relative overflow-hidden group transition-all duration-200 ${
              isDragOver ? 'border-primary/60 bg-primary/5 ring-2 ring-primary/20' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {!isUploading && (
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept=".pdf" aria-label="Upload resume PDF" />
            )}
            {isUploading ? (
              <div className="py-10 flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-primary-400 animate-spin mb-4" />
                <p className="font-semibold text-gray-300">Analyzing your resume...</p>
                <p className="text-xs text-gray-500 mt-2">Parsing text, extracting skills, computing ATS score</p>
              </div>
            ) : analysis ? (
              <div className="py-10">
                <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-200 mb-1">Resume Analyzed</h3>
                <p className="text-sm text-gray-500 mb-4">Upload a new PDF to re-analyze</p>
                <div className="relative inline-block">
                  <button className="btn-secondary text-sm">Upload New Resume</button>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf" />
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-200 mb-1">{isDragOver ? 'Drop your PDF here' : 'Upload Resume'}</h3>
                <p className="text-sm text-gray-500 mb-5">Drag & drop or click to browse • PDF, max 10MB</p>
                <span className="btn-primary text-sm">Browse Files</span>
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary-400" />
              <span className="text-xs font-semibold text-primary-300 uppercase tracking-wider">ATS Tip</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">Use a single-column layout. Avoid tables, headers, footers, and graphics. ATS parsers work best with simple, clean formatting.</p>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis ? (
          <div className="lg:col-span-8 space-y-6 animate-fade-in">
            {/* Score + Breakdown */}
            <div className="glass-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <svg className="w-40 h-40 -rotate-90">
                      <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                      <circle cx="80" cy="80" r="68" fill="none" stroke={scoreColor(analysis.score)} strokeWidth="12"
                        strokeDasharray={2 * Math.PI * 68} strokeDashoffset={(2 * Math.PI * 68) * (1 - analysis.score / 100)}
                        strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-gray-100">{analysis.score}</span>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">ATS Score</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Score Breakdown</h3>
                  {analysis.breakdown && BREAKDOWN_LABELS.map(dim => (
                    <div key={dim.key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-400">{dim.label}</span>
                        <span className="text-xs font-bold text-gray-300">{analysis.breakdown[dim.key]}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${analysis.breakdown[dim.key]}%`, backgroundColor: dim.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            {analysis.summary && (
              <div className="glass-card p-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">AI Summary</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
              </div>
            )}

            {/* Skills */}
            <div className="glass-card p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Extracted Skills <span className="ml-2 text-primary-400">{analysis.skills.length}</span>
              </h3>
              {analysis.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map(skill => (
                    <span key={skill} className="badge-info text-xs">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No skills detected. Ensure your resume has a clear skills section.</p>
              )}
            </div>

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">AI Recommendations</h3>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-surface-200/50 rounded-xl border border-border">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Improvements */}
            {!improvements && (
              <button onClick={loadImprovements} disabled={loadingImprovements}
                className="btn-secondary text-sm flex items-center gap-2 mx-auto">
                {loadingImprovements ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary-400" />}
                {loadingImprovements ? 'Generating...' : 'Get AI Improvement Suggestions'}
              </button>
            )}
            {improvements && (
              <div className="glass-card p-6 animate-fade-in">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">AI-Powered Improvements</h3>
                <p className="text-sm text-gray-300 mb-4">{improvements.overall_assessment}</p>
                {improvements.critical_improvements.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-xs font-semibold text-amber-400">Critical Improvements</h4>
                    {improvements.critical_improvements.map((tip, i) => (
                      <p key={i} className="text-sm text-gray-400 pl-4 border-l-2 border-amber-500/30">{tip}</p>
                    ))}
                  </div>
                )}
                {improvements.skill_suggestions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-xs font-semibold text-primary-400">Suggested Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {improvements.skill_suggestions.map((s, i) => <span key={i} className="badge-warning text-xs">{s}</span>)}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4 text-sm">
                  <span className="text-gray-500">Score potential after improvements:</span>
                  <span className="font-bold text-emerald-400">{improvements.score_potential}/100</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 glass-card flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
              <FileText className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-gray-500 font-medium">Upload a resume to see AI analysis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
