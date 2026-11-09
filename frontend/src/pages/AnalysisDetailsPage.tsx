import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  ListOrdered,
  Bug,
  Sparkles,
  FileCode,
  CheckSquare,
  ShieldAlert,
  Clock,
  Terminal,
  AlertCircle,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SeverityBadge } from '../components/analysis/SeverityBadge';
import { CircularProgress } from '../components/common/CircularProgress';
import { CodeViewer } from '../components/analysis/CodeViewer';
import { PDFReportModal } from '../components/analysis/PDFReportModal';
import { formatDate, getPriorityStyles, getCategoryLabel } from '../lib/utils';

export const AnalysisDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnalysisById, toggleFixRecommendation } = useAnalysis();
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [copiedSteps, setCopiedSteps] = useState(false);

  const analysis = getAnalysisById(id || '');

  if (!analysis) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-[#111827]">Analysis Report Not Found</h2>
        <p className="text-xs text-[#6B7280]">
          The requested bug analysis report does not exist or was deleted.
        </p>
        <Button variant="primary" onClick={() => navigate('/app/history')}>
          Back to History
        </Button>
      </div>
    );
  }

  const handleCopySteps = () => {
    const stepsText = analysis.reproductionSteps.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
    navigator.clipboard.writeText(stepsText);
    setCopiedSteps(true);
    setTimeout(() => setCopiedSteps(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Bar with Back Button & Export PDF Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/history')}
            className="p-2 rounded-2xl bg-white border border-[#E5E7EB] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={analysis.severity} />
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getPriorityStyles(analysis.priority)}`}
              >
                {analysis.priority} PRIORITY
              </span>
              <span className="text-xs text-[#6B7280] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatDate(analysis.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight mt-1">
              {analysis.title}
            </h1>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => setShowPDFModal(true)}
          className="shrink-0 shadow-md shadow-blue-500/20"
        >
          Export PDF Report
        </Button>
      </div>

      {/* Top Overview Card: Uploaded Documents Display */}
      <Card padded className="space-y-4 bg-slate-50/70">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Uploaded Diagnostic Artifacts (
            {analysis.uploadedFiles.length})
          </h3>
          <span className="text-[11px] text-[#6B7280]">Provided by Developer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {analysis.uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="p-3 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-3 text-xs"
            >
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#111827] truncate">{file.name}</p>
                <div className="flex items-center justify-between text-[10px] text-[#6B7280] mt-0.5">
                  <span>{getCategoryLabel(file.category)}</span>
                  <span>{file.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grid of AI Diagnostic Results Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols Wide): Core Findings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Bug Executive Summary */}
          <Card padded className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Bug className="w-4 h-4" />
                </div>
                <span>Executive Summary</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {analysis.bugSummary && analysis.bugSummary.length > 0 ? `${analysis.bugSummary.length} Key Points` : 'Summary'}
              </span>
            </div>

            {analysis.bugSummary && analysis.bugSummary.length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-800 bg-slate-50 p-4 rounded-2xl border border-[#E5E7EB]">
                {analysis.bugSummary.map((line, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-[#111827] leading-relaxed bg-slate-50 p-4 rounded-2xl border border-[#E5E7EB] whitespace-pre-line">
                {analysis.summary}
              </div>
            )}
          </Card>

          {/* Card 2: Reproduction Steps */}
          <Card padded className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <span>Reproduction Steps</span>
              </div>

              <button
                onClick={handleCopySteps}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl transition-colors"
              >
                {copiedSteps ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSteps ? 'Copied' : 'Copy Steps'}</span>
              </button>
            </div>

            <ol className="space-y-2 text-xs text-slate-700">
              {analysis.reproductionSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-2.5 bg-white rounded-xl border border-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="mt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* Card 3: Root Cause Analysis */}
          <Card padded className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span>Root Cause Technical Analysis</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              {analysis.rootCauseAnalysis.map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-3 bg-amber-50/40 rounded-2xl border border-amber-200/60"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Card 5: Suggested Files & Code Patch Viewer */}
          <Card padded className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <FileCode className="w-4 h-4" />
                </div>
                <span>Suggested Code Patches ({analysis.suggestedFiles.length})</span>
              </div>
              <Badge variant="primary" size="sm">
                Verified Fix
              </Badge>
            </div>

            <div className="space-y-6">
              {analysis.suggestedFiles && analysis.suggestedFiles.length > 0 ? (
                analysis.suggestedFiles.map((file, idx) => (
                  <CodeViewer key={idx} file={file} />
                ))
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>you have not uploaded any source code . please try again after uploading require code files</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col Wide): Confidence Score & Actionable Checklist */}
        <div className="space-y-6">
          {/* Card 4: Confidence Score Gauge */}
          <Card padded className="text-center space-y-4">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Confidence Score</span>
            </div>

            <CircularProgress value={analysis.confidenceScore} size={150} />

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs">
              <p className="font-bold text-blue-900">{analysis.confidenceSummary}</p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Matched against AST graph signature patterns.
              </p>
            </div>
          </Card>

          {/* Card 7: Severity & Priority Summary */}
          <Card padded className="space-y-3">
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Risk Assessment
            </h4>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                <p className="text-[10px] text-red-600 uppercase font-bold">Severity</p>
                <p className="text-sm font-extrabold text-red-700 mt-0.5">{analysis.severity}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                <p className="text-[10px] text-purple-600 uppercase font-bold">Priority</p>
                <p className="text-sm font-extrabold text-purple-700 mt-0.5">{analysis.priority}</p>
              </div>
            </div>
          </Card>

          {/* Card 6: Fix Recommendations Checklist */}
          <Card padded className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" /> Actionable Fix Checklist
              </h4>
              <span className="text-[11px] font-bold text-emerald-600">
                {analysis.fixRecommendations.filter((r) => r.completed).length}/
                {analysis.fixRecommendations.length} Done
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {analysis.fixRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => toggleFixRecommendation(analysis.id, rec.id)}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                    rec.completed
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through'
                      : 'bg-white border-slate-200 text-slate-900 hover:border-blue-300'
                  }`}
                >
                  <div className="mt-0.5">
                    {rec.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-md border border-slate-300 shrink-0 hover:border-blue-500" />
                    )}
                  </div>
                  <span className="leading-relaxed">{rec.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* PDF Export Modal */}
      <PDFReportModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        analysis={analysis}
      />
    </div>
  );
};
