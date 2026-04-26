import React, { useState, useEffect } from 'react';
import { FileText, Download, AlertCircle, Calendar } from 'lucide-react';
import { apiGetResume, apiDownloadResume } from '../../services/api';
import { SkeletonPage } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';
import { useToast } from '../shared/Toast';

const MyResumes: React.FC = () => {
  const { addToast } = useToast();
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiGetResume();
      if (data) {
        setResume(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await apiDownloadResume();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.file_name || 'Current_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      addToast('error', 'Failed to download resume');
    }
  };

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">My Resumes</h1>
        <p className="text-gray-500 mt-1">Manage your uploaded resumes and documents.</p>
      </div>

      {!resume ? (
        <div className="glass-card">
          <EmptyState 
            icon={<FileText className="w-8 h-8 text-gray-500" />}
            title="No Resumes Uploaded" 
            description="You haven't uploaded any resumes yet. Head over to the Resume Analyzer to upload one." 
          />
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-200">{resume.file_name || 'Current_Resume.pdf'}</h4>
                <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Uploaded recently</span>
                  <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> ATS Score: {resume.score}/100</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleDownload}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResumes;
