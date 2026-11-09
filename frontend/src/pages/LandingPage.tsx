import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Bug,
  FileText,
  CheckCircle2,
  Sparkles,
  Cpu,
  Code2,
  Activity,
  Download,
  Search,
  Sliders,
  ChevronRight,
  Github,
  Star,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bug,
      title: 'Root Cause Detection',
      description:
        'Pinpoint the exact file, function, and memory allocation causing system exceptions in seconds.',
    },
    {
      icon: FileText,
      title: 'Bug Summaries',
      description:
        'Convert dense 10,000 line console dumps into clear 3-sentence executive summaries.',
    },
    {
      icon: CheckCircle2,
      title: 'Fix Recommendations',
      description:
        'Get verified code diffs and actionable checklists designed to solve bugs without introducing side effects.',
    },
    {
      icon: Sparkles,
      title: 'Confidence Scoring',
      description:
        'AI model evaluates stack trace AST depth to assign a precision confidence percentage to every diagnosis.',
    },
    {
      icon: Download,
      title: 'Export PDF Reports',
      description:
        'Share pristine, formatted PDF diagnostic reports directly with product managers and QA leads.',
    },
    {
      icon: Cpu,
      title: 'Multi-File Parsing',
      description:
        'Upload bug reports, raw stack traces, browser logs, screenshots, and code files simultaneously.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[#111827]">RootCause</span>
              <span className="text-xs font-extrabold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 ml-1">
                AI
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-blue-600 transition-colors">
              How it works
            </a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">
              Performance
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <Badge variant="primary" className="mx-auto px-4 py-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Introducing RootCause AI Engine v3.5</span>
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#111827] tracking-tight leading-[1.15]">
            AI-Powered Bug Analysis <br />
            <span className="text-gradient">Assistant for Developers</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto font-normal leading-relaxed">
            Analyze bug reports, console logs, stack traces, screenshots, and code snippets in
            seconds using AI. Get instant root causes, confidence scores, and code patches.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Zap className="w-5 h-5 fill-current" />}
              onClick={() => navigate('/app/new-analysis')}
              className="w-full sm:w-auto shadow-xl shadow-blue-500/25"
            >
              Analyze Your First Bug Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Github className="w-5 h-5" />}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto"
            >
              Sign In with GitHub
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-[#6B7280] pt-4 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.9/5 engineering rating
            </span>
          </div>
        </motion.div>

        {/* Workflow Section */}
        <section id="workflow" className="mt-16 max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
              How the workflow works
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              Upload real bug evidence, let the engine analyze it, and review the generated fix plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Search,
                title: 'Capture the evidence',
                description: 'Add reports, logs, stack traces, screenshots, and code snippets from the incident.',
              },
              {
                icon: Sliders,
                title: 'Run analysis',
                description: 'The backend processes the uploaded files and generates a structured diagnosis.',
              },
              {
                icon: Activity,
                title: 'Review the fix',
                description: 'Open the report, inspect recommendations, and move straight to remediation.',
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-soft space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827]">{step.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
              Engineered for Production Software Teams
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Everything you need to diagnose production outages, frontend crashes, and complex
              memory leaks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] hover:border-blue-300 hover:shadow-soft transition-all duration-200 space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] text-blue-600 flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827]">{feat.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-16 max-w-7xl mx-auto px-6 w-full text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-soft">
          <div>
            <p className="text-4xl font-extrabold text-[#2563EB]">99.4%</p>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">Root Cause Accuracy</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#111827]">10x</p>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">Faster Debugging Speed</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#2563EB]">1.2M+</p>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">Bugs Analyzed</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#111827]">0.4s</p>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">Average Response Time</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-[#E5E7EB] py-12 px-6 text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-slate-900 text-sm">RootCause AI</span>
            <span>© 2026 RootCause AI Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/app/dashboard')} className="hover:text-blue-600">
              Dashboard
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-blue-600">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="hover:text-blue-600">
              Register
            </button>
            <button onClick={() => navigate('/app/settings')} className="hover:text-blue-600">
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
