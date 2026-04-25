import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, Target, BarChart3, Shield, Zap,
  ChevronRight, ArrowRight, CheckCircle2, Brain, Users, Upload,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'AI-Powered Parsing',
    description: 'Our LLM engine extracts skills, experience, and education from any PDF resume with 95%+ accuracy.',
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/20',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Smart Job Matching',
    description: 'TF-IDF cosine similarity and weighted multi-dimensional scoring align candidates to the best-fit roles.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Rich Analytics',
    description: 'Radar charts, skill gap analysis, and real-time match quality distributions power data-driven decisions.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Deterministic ATS Scoring',
    description: '5-dimension scoring engine — Skills (40%), Experience (25%), Keywords (15%), Education (10%), Quality (10%).',
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
  },
];

const STEPS = [
  { icon: <Upload className="w-7 h-7" />, title: 'Upload Resume', description: 'Drop your PDF and our AI parses it in seconds' },
  { icon: <Zap className="w-7 h-7" />, title: 'Get ATS Score', description: 'Receive a deterministic score with detailed breakdown' },
  { icon: <Target className="w-7 h-7" />, title: 'Match to Jobs', description: 'AI matches your profile against all open positions' },
  { icon: <BarChart3 className="w-7 h-7" />, title: 'Track & Improve', description: 'Analytics dashboard shows skill gaps and growth areas' },
];

const STATS = [
  { value: '5', label: 'Score Dimensions' },
  { value: '50+', label: 'Skill Aliases' },
  { value: '< 5s', label: 'Parse Time' },
  { value: '100%', label: 'Open Source' },
];

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState(target);
  return <span>{display}{suffix}</span>;
}

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-gray-100 overflow-x-hidden">
      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-surface-50/80 backdrop-blur-xl border-b border-border shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center border border-primary/25 group-hover:bg-primary/25 transition-colors">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
              SmartMatch AI
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/student/login"
              className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-surface-200/50 transition-all">
              Sign In
            </Link>
            <Link to="/student/register"
              className="px-5 py-2.5 text-sm font-semibold bg-primary hover:bg-primary-600 text-white rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary-300 font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered ATS Resume Matching Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in">
            Match Resumes to Jobs{' '}
            <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              with Intelligence
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in">
            SmartMatch AI combines deterministic ATS scoring with LLM-powered parsing to deliver
            transparent, explainable resume-job matching. Built for students and recruiters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link to="/student/register"
              className="group px-8 py-4 bg-primary hover:bg-primary-600 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 flex items-center gap-3 text-base">
              Start as Student
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/admin/login"
              className="px-8 py-4 bg-surface-200/50 hover:bg-surface-200 border border-border text-gray-300 font-semibold rounded-2xl transition-all flex items-center gap-3 text-base">
              <Users className="w-5 h-5" />
              Recruiter Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ────────────────────────────────────────────── */}
      <section className="py-12 border-y border-border/50 bg-surface-50/30">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-300 to-violet-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
              Engineered for <span className="text-primary-400">Precision</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Every match is backed by a 5-dimension scoring algorithm with full transparency — no black boxes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i}
                className={`group p-7 rounded-2xl bg-gradient-to-br ${feature.gradient} border ${feature.border} hover:border-primary/30 transition-all duration-300 hover:-translate-y-1`}>
                <div className="w-12 h-12 rounded-xl bg-surface-50/80 border border-border flex items-center justify-center text-primary-400 mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface-50/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
              How It <span className="text-primary-400">Works</span>
            </h2>
            <p className="text-gray-500 text-lg">Four steps from resume upload to actionable career insights.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-400 mb-5 group-hover:bg-primary/20 transition-colors">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-primary/30">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-200 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-3 w-5 h-5 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
              Built With <span className="text-primary-400">Modern Tech</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'React 18', desc: 'TypeScript + Vite' },
              { name: 'Node.js', desc: 'Express REST API' },
              { name: 'Groq AI', desc: 'Llama 3.3 70B LLM' },
              { name: 'TailwindCSS', desc: 'Glassmorphism UI' },
              { name: 'SQLite', desc: 'better-sqlite3 WAL' },
              { name: 'TF-IDF', desc: 'Cosine Similarity' },
              { name: 'JWT + bcrypt', desc: 'Role-based Auth' },
              { name: 'Recharts', desc: 'Interactive Charts' },
            ].map((tech, i) => (
              <div key={i} className="p-4 bg-surface-200/30 border border-border rounded-xl text-center hover:border-primary/20 transition-colors">
                <p className="font-bold text-gray-200 text-sm">{tech.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-600/5" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/15 rounded-2xl border border-primary/20 mb-6">
            <Sparkles className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            Ready to Get Matched?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Upload your resume and discover which roles align with your skills. It's free and takes less than 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/student/register"
              className="group px-8 py-4 bg-primary hover:bg-primary-600 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 flex items-center gap-3 text-base">
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/admin/register"
              className="px-8 py-4 bg-surface-200/50 hover:bg-surface-200 border border-border text-gray-300 font-semibold rounded-2xl transition-all flex items-center gap-3 text-base">
              Register as Recruiter
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-border/50 bg-surface-50/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center border border-primary/25">
              <Sparkles className="w-4 h-4 text-primary-400" />
            </div>
            <span className="font-bold text-gray-300">SmartMatch AI</span>
          </div>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} SmartMatch AI. Built with ❤️ by Priyanshu Singh.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Priyanshusingh0818/resume-matching" target="_blank" rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors">GitHub</a>
            <Link to="/student/login" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">Student</Link>
            <Link to="/admin/login" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
