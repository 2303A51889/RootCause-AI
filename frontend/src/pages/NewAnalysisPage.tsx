import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Zap,
  Code,
  Terminal,
  Image as ImageIcon,
  Info,
  AlertCircle,
  Loader2,
  FileCode,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { UploadedFileItem, FileCategory } from '../types';
import { getCategoryLabel } from '../lib/utils';

export const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { createAnalysis } = useAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('STACK_TRACE');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState('');

  const categories: { type: FileCategory; label: string; icon: any }[] = [
    { type: 'BUG_REPORT', label: 'Bug Report', icon: FileText },
    { type: 'LOGS', label: 'Console Logs', icon: Terminal },
    { type: 'STACK_TRACE', label: 'Stack Trace', icon: AlertCircle },
    { type: 'SCREENSHOT', label: 'Screenshot', icon: ImageIcon },
    { type: 'CODE_SNIPPET', label: 'Code Snippet', icon: Code },
    { type: 'ENVIRONMENT', label: 'Environment', icon: Info },
  ];

  const handleZoneKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileDrop = (files: FileList | File[]) => {
    setError(''); // Clear previous error
    const newItems: UploadedFileItem[] = Array.from(files).map((file) => ({
      id: `uf-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      category: selectedCategory,
      progress: 0,
      status: 'uploading',
      file,
    }));

    setUploadedFiles((prev) => [...prev, ...newItems]);

    // Simulate file upload progress animation
    newItems.forEach((item) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 25;
        setUploadedFiles((prev) =>
          prev.map((f) => {
            if (f.id === item.id) {
              const updatedProgress = Math.min(currentProgress, 100);
              return {
                ...f,
                progress: updatedProgress,
                status: updatedProgress === 100 ? 'completed' : 'uploading',
              };
            }
            return f;
          }),
        );
        if (currentProgress >= 100) clearInterval(interval);
      }, 150);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return;
    setIsAnalyzing(true);
    setError('');

    const steps = [
      'Parsing diagnostic files & AST traces...',
      'Running AI pattern matching algorithm...',
      'Identifying root cause & memory leaks...',
      'Generating verified code fix recommendation...',
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        setAnalysisStep(i);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      const newId = await createAnalysis({
        title: title || 'Production Exception Analysis',
        description: description || 'Diagnostic report derived from uploaded log artifacts.',
        uploadedFiles: uploadedFiles,
      });

      setIsAnalyzing(false);
      navigate(`/app/history/${newId}`);
    } catch (err: any) {
      setIsAnalyzing(false);
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to complete analysis pipeline. Please try again.';
      setError(errMsg);
    }
  };

  const analysisSteps = [
    'Parsing files & AST stack traces',
    'AI pattern matching',
    'Root cause diagnosis',
    'Generating fix patches',
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            New Bug Analysis
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Upload bug-related files for instant AI root cause diagnosis and fix patches.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-800">Analysis Failed</h4>
            <p className="text-xs text-red-700 leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Form Fields & File Category Badges */}
      <Card padded className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Bug Title / Incident Name"
            placeholder="e.g. Login fails after deployment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider">
              Target File Category
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.type;
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => setSelectedCategory(cat.type)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium border transition-all ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Large Drag & Drop Upload Zone Card */}
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) handleFileDrop(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleZoneKeyDown}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer shadow-sm ${
            isDragOver
              ? 'border-blue-600 bg-blue-50/50'
              : 'border-[#E5E7EB] hover:border-blue-400 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".js,.jsx,.tsx,.py,.java,.ts,.json,.log,.txt,.pdf,.png,.jpg,.jpeg,.md"
            className="hidden"
            aria-label="Upload diagnostic files"
            onChange={(e) => {
              if (e.target.files) handleFileDrop(e.target.files);
            }}
          />

          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#111827]">
            Drop bug evidence here, or <span className="text-blue-600 underline">choose files</span>
          </h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-md mx-auto">
            Supports Source Code (<strong>.js</strong>, <strong>.jsx</strong>, <strong>.tsx</strong>, <strong>.py</strong>, <strong>.java</strong>, <strong>.ts</strong>, <strong>.json</strong>), Logs (<strong>.log</strong>), Stack Traces (<strong>.txt</strong>), Reports (<strong>.pdf</strong>, <strong>.md</strong>), and Screenshots.
          </p>
          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </Button>
          </div>
        </div>

        {/* Uploaded Files Cards List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Uploaded Diagnostic Files ({uploadedFiles.length})
            </h4>

            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#111827] truncate">{file.name}</p>
                        <Badge size="sm" variant="default">
                          {getCategoryLabel(file.category)}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">{file.size}</p>

                      {/* Animated Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            style={{ width: `${file.progress}%` }}
                            className="bg-blue-600 h-full transition-all duration-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {file.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 animate-bounce" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Large Analyze Bug Button */}
        <Button
          variant="primary"
          size="lg"
          disabled={uploadedFiles.length === 0}
          onClick={handleAnalyze}
          leftIcon={<Zap className="w-5 h-5 fill-current" />}
          className="w-full shadow-lg shadow-blue-500/25 py-4 text-base font-bold rounded-2xl"
        >
          Analyze Bug with AI Engine
        </Button>
      </Card>

      {/* Full Screen / Overlay Loading Modal for AI Analysis */}
      <AnimatePresence>
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-[#E5E7EB]"
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto relative">
                <Zap className="w-10 h-10 fill-current animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#111827]">Diagnosing Root Cause...</h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  AI model evaluating stack trace AST tree
                </p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {analysisSteps.map((stepLabel, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    {idx < analysisStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : idx === analysisStep ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span
                      className={
                        idx <= analysisStep ? 'font-bold text-slate-900' : 'text-slate-400'
                      }
                    >
                      {stepLabel}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
