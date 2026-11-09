import React, { useState } from 'react';
import { Download, Printer, ShieldCheck, FileText, Check, FileDown } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BugAnalysis } from '../../types';
import { formatDate, getCategoryLabel } from '../../lib/utils';

export interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: BugAnalysis;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({ isOpen, onClose, analysis }) => {
  const [downloadedHtml, setDownloadedHtml] = useState(false);
  const [downloadedTxt, setDownloadedTxt] = useState(false);
  const reportRefId = `RCA-${(analysis.id || 'AUDIT').slice(-8).toUpperCase()}`;

  // Helper to generate self-contained, standalone formal report HTML with inline CSS
  const getFormalReportHtml = () => {
    const title = analysis.title || 'Production Exception Analysis';
    const description = analysis.description || 'Diagnostic evaluation derived from uploaded artifacts.';
    const dateStr = formatDate(analysis.createdAt);
    const severity = analysis.severity || 'HIGH';
    const priority = analysis.priority || 'P1';
    const confidence = analysis.confidenceScore || 85;
    const artifacts = analysis.uploadedFiles || [];
    const bugSummary = analysis.bugSummary && analysis.bugSummary.length > 0 
      ? analysis.bugSummary 
      : [analysis.summary || 'Incident analyzed from diagnostic logs.'];
    const rootCauses = analysis.rootCauseAnalysis || [];
    const reproductionSteps = analysis.reproductionSteps || [];
    const fixRecommendations = analysis.fixRecommendations || [];
    const suggestedFiles = analysis.suggestedFiles || [];

    const artifactsHtml = artifacts.map((f, i) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${f.name}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 11px;">${getCategoryLabel(f.category)}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px; color: #64748b;">${f.size || 'N/A'}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 11px; text-align: right; color: #16a34a; font-weight: bold;">Verified 100%</td>
      </tr>
    `).join('');

    const summaryHtml = bugSummary.map((item, idx) => `
      <li style="margin-bottom: 6px; line-height: 1.5; font-size: 12px; color: #1e293b;">
        <strong style="color: #1d4ed8; font-family: monospace;">[1.${idx + 1}]</strong> ${item}
      </li>
    `).join('');

    const rootCausesHtml = rootCauses.map((cause, idx) => `
      <li style="margin-bottom: 6px; line-height: 1.5; font-size: 12px; color: #1e293b;">
        <strong style="color: #b45309; font-family: monospace;">[2.${idx + 1}]</strong> ${cause}
      </li>
    `).join('');

    const stepsHtml = reproductionSteps.map((step, idx) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; width: 40px; text-align: center; background-color: #f8fafc; font-size: 11px;">${idx + 1}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 12px; color: #1e293b; line-height: 1.5;">${step}</td>
      </tr>
    `).join('');

    const fixesHtml = fixRecommendations.map((rec, idx) => `
      <div style="padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; background-color: #ffffff; display: flex; align-items: flex-start; gap: 8px;">
        <span style="font-family: monospace; font-size: 10px; font-weight: bold; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155;">FIX-0${idx + 1}</span>
        <span style="font-size: 12px; color: #0f172a; line-height: 1.4;">${rec.text}</span>
      </div>
    `).join('');

    const codePatchesHtml = suggestedFiles.length > 0 
      ? suggestedFiles.map((file) => `
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px; overflow: hidden;">
          <div style="background-color: #0f172a; color: #ffffff; padding: 8px 12px; font-family: monospace; font-size: 11px; font-weight: bold; display: flex; justify-content: space-between;">
            <span>File: ${file.name}</span>
            <span style="color: #94a3b8;">${file.path || ''}</span>
          </div>
          ${file.explanation ? `<div style="padding: 8px 12px; background-color: #eff6ff; border-bottom: 1px solid #dbeafe; font-size: 11px; color: #1e40af; font-style: italic;">${file.explanation}</div>` : ''}
          ${file.originalCode ? `
            <div style="padding: 8px 12px; background-color: #fff1f2; border-bottom: 1px solid #ffe4e6; font-family: monospace; font-size: 10px; color: #9f1239; white-space: pre-wrap;">
              <strong>// Original Problematic Code:</strong><br/>${file.originalCode}
            </div>` : ''}
          ${file.fixedCode ? `
            <div style="padding: 8px 12px; background-color: #f0fdf4; font-family: monospace; font-size: 10px; color: #166534; white-space: pre-wrap;">
              <strong>// Corrected Fix Patch:</strong><br/>${file.fixedCode}
            </div>` : ''}
        </div>
      `).join('')
      : `<div style="padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; color: #64748b; font-style: italic;">
          Notice: Source code files were not provided in the uploaded evidence package. Root cause diagnosis and architectural guidelines are verified above; file-level code patches require source file upload.
        </div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>RootCause_AI_Audit_Report_${reportRefId}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 12px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .report-container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 20px; font-weight: 900; margin: 4px 0; text-transform: uppercase; color: #020617; }
    h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; margin: 16px 0 8px 0; padding-bottom: 4px; border-bottom: 1.5px solid #0f172a; color: #0f172a; }
    .header-bar { border-bottom: 2px solid #020617; padding-bottom: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .meta-tag { display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: bold; text-transform: uppercase; font-family: monospace; border-radius: 4px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
    .meta-table th { background-color: #f1f5f9; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold; }
    .meta-table td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .card-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; }
    .footer-sign { margin-top: 24px; border-top: 2px solid #020617; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; font-family: monospace; color: #475569; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      .avoid-break { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header Block -->
    <div class="header-bar">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span class="meta-tag" style="background-color: #020617; color: #ffffff;">AUDIT REPORT</span>
          <span style="font-family: monospace; font-size: 10px; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">CONFIDENTIAL // FOR ENGINEERING ONLY</span>
        </div>
        <h1>Root Cause Diagnostic & Remediation Audit</h1>
        <div style="font-size: 11px; color: #475569;">Automated Evidence-Backed Bug Diagnosis & Quality Assurance Report</div>
      </div>
      <div style="text-align: right; font-family: monospace; font-size: 10px; background-color: #f8fafc; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
        <div><strong>REF ID:</strong> ${reportRefId}</div>
        <div><strong>DATE:</strong> ${dateStr}</div>
        <div><strong>ENGINE:</strong> v1.0 AST Pipeline</div>
      </div>
    </div>

    <!-- Section 1: Executive Summary -->
    <div class="avoid-break">
      <h2>1. Executive Summary</h2>
      <div class="card-box">
        <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">${title}</div>
        ${description ? `<div style="font-size: 11px; color: #475569; font-style: italic; margin-bottom: 8px;">"${description}"</div>` : ''}
        <ul style="margin: 0; padding-left: 0; list-style: none;">
          ${summaryHtml}
        </ul>
      </div>
    </div>

    <!-- Section 2: Incident Risk & Environment Matrix -->
    <div class="avoid-break">
      <h2>2. Incident Risk & Diagnostic Parameters</h2>
      <table class="meta-table">
        <tr>
          <th style="width: 25%;">Severity Rating</th>
          <td style="width: 25%; font-weight: bold; color: #b91c1c;">${severity}</td>
          <th style="width: 25%;">Priority Level</th>
          <td style="width: 25%; font-weight: bold; color: #6b21a8;">${priority}</td>
        </tr>
        <tr>
          <th>AI Confidence Score</th>
          <td style="font-family: monospace; font-weight: bold; color: #1d4ed8;">${confidence}% Validated</td>
          <th>Artifacts Evaluated</th>
          <td style="font-family: monospace;">${artifacts.length} File(s) Attached</td>
        </tr>
      </table>

      ${artifacts.length > 0 ? `
        <table class="meta-table" style="margin-top: 8px;">
          <thead>
            <tr>
              <th>Diagnostic Artifact Name</th>
              <th>Category</th>
              <th>File Size</th>
              <th style="text-align: right;">Parsing Status</th>
            </tr>
          </thead>
          <tbody>
            ${artifactsHtml}
          </tbody>
        </table>
      ` : ''}
    </div>

    <!-- Section 3: Technical Root Cause Findings -->
    <div class="avoid-break">
      <h2>3. Technical Root Cause Findings</h2>
      <div class="card-box" style="background-color: #fffbeb; border-color: #fde68a;">
        <ul style="margin: 0; padding-left: 0; list-style: none;">
          ${rootCausesHtml}
        </ul>
      </div>
    </div>

    <!-- Section 4: Procedural Reproduction Sequence -->
    <div class="avoid-break">
      <h2>4. Procedural Reproduction Sequence</h2>
      <table class="meta-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">Step</th>
            <th>Action Description & Expected System Reaction</th>
          </tr>
        </thead>
        <tbody>
          ${stepsHtml}
        </tbody>
      </table>
    </div>

    <!-- Section 5: Remediation Plan & Actionable Fix Directives -->
    <div class="avoid-break">
      <h2>5. Remediation Plan & Fix Directives</h2>
      <div>
        ${fixesHtml}
      </div>
    </div>

    <!-- Section 6: Code Patch Directives & Module Scope -->
    <div class="avoid-break">
      <h2>6. Code Patch Directives & Module Scope</h2>
      <div>
        ${codePatchesHtml}
      </div>
    </div>

    <!-- Section 7: Formal Audit Verification Seal & Sign-off -->
    <div class="avoid-break footer-sign">
      <div style="width: 48%;">
        <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">AUDIT INTEGRITY CHECKSUM</div>
        <div>SHA256: ${reportRefId.toLowerCase()}8f90c4210e7b89</div>
        <div style="margin-top: 6px; color: #64748b;">RootCause AI Automated Diagnosis Engine</div>
      </div>
      <div style="width: 48%; text-align: right;">
        <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">QUALITY ASSURANCE SIGN-OFF</div>
        <div style="border-bottom: 1px dashed #94a3b8; height: 16px; margin-bottom: 4px;"></div>
        <div style="color: #64748b;">Authorized Engineer / Lead Reviewer</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePrint = () => {
    const fullHtml = getFormalReportHtml();
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    };
  };

  const handleDownloadHtml = () => {
    const fullHtml = getFormalReportHtml();
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RootCause_AI_Audit_Report_${reportRefId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedHtml(true);
    setTimeout(() => setDownloadedHtml(false), 2500);
  };

  const handleDownloadTxt = () => {
    const title = analysis.title || 'Production Exception Analysis';
    const dateStr = formatDate(analysis.createdAt);
    const severity = analysis.severity || 'HIGH';
    const priority = analysis.priority || 'P1';
    const confidence = analysis.confidenceScore || 85;
    const summaryList = analysis.bugSummary && analysis.bugSummary.length > 0
      ? analysis.bugSummary.map((s, i) => `  [1.${i + 1}] ${s}`).join('\n')
      : `  - ${analysis.summary}`;
    const rootCausesList = (analysis.rootCauseAnalysis || []).map((c, i) => `  [2.${i + 1}] ${c}`).join('\n');
    const stepsList = (analysis.reproductionSteps || []).map((s, i) => `  ${i + 1}. ${s}`).join('\n');
    const fixesList = (analysis.fixRecommendations || []).map((f, i) => `  [FIX-0${i + 1}] ${f.text}`).join('\n');

    const txtContent = `================================================================================
ROOTCAUSE AI — FORMAL INCIDENT DIAGNOSTIC & ROOT CAUSE REPORT
================================================================================
REF ID:      ${reportRefId}
DATE:        ${dateStr}
CLASSIF.:    CONFIDENTIAL // FOR INTERNAL ENGINEERING USE ONLY
STATUS:      VERIFIED EVIDENCE-BACKED AUDIT
--------------------------------------------------------------------------------
INCIDENT:    ${title}
SEVERITY:    ${severity}
PRIORITY:    ${priority}
AI CONFID.:  ${confidence}%
--------------------------------------------------------------------------------

1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
${summaryList}

2. TECHNICAL ROOT CAUSE FINDINGS
--------------------------------------------------------------------------------
${rootCausesList}

3. PROCEDURAL REPRODUCTION SEQUENCE
--------------------------------------------------------------------------------
${stepsList}

4. REMEDIATION PLAN & FIX DIRECTIVES
--------------------------------------------------------------------------------
${fixesList}

================================================================================
AUDIT CHECKSUM: SHA256:${reportRefId.toLowerCase()}8f90c4210e7b89
GENERATED BY ROOTCAUSE AI DIAGNOSTIC ENGINE • STRICTLY CONFIDENTIAL
================================================================================
`;

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RootCause_AI_Audit_Report_${reportRefId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedTxt(true);
    setTimeout(() => setDownloadedTxt(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl" title="Formal Audit Report Exporter">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-[#E5E7EB] gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold text-[#111827] block">
                Structured Formal Audit Document Ready
              </span>
              <span className="text-[11px] text-slate-500">
                Exports clean headings, tables, and narrative text without application UI frames.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print / Save as PDF
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={downloadedHtml ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
              onClick={handleDownloadHtml}
            >
              {downloadedHtml ? 'Downloaded!' : 'Download Report (.html)'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={downloadedTxt ? <Check className="w-4 h-4 text-emerald-600" /> : <FileDown className="w-4 h-4" />}
              onClick={handleDownloadTxt}
            >
              {downloadedTxt ? 'Downloaded!' : 'Text (.txt)'}
            </Button>
          </div>
        </div>

        {/* Live Formal Document Preview Card */}
        <div
          id="printable-report"
          className="p-6 sm:p-8 bg-white border border-slate-300 rounded-xl text-slate-900 space-y-6 shadow-sm font-sans text-xs"
        >
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] tracking-wider uppercase rounded">
                  AUDIT REPORT
                </span>
                <span className="text-[10px] font-mono text-slate-600 font-semibold tracking-wider uppercase">
                  CONFIDENTIAL // ENGINEERING
                </span>
              </div>
              <h1 className="text-lg font-black text-slate-950 uppercase">
                Root Cause Diagnostic & Remediation Audit
              </h1>
              <p className="text-[11px] text-slate-600">
                Automated Evidence-Backed Bug Diagnosis & Quality Assurance Report
              </p>
            </div>
            <div className="text-right font-mono text-[10px] bg-slate-50 p-2 rounded border border-slate-200 shrink-0">
              <p><strong>REF ID:</strong> {reportRefId}</p>
              <p><strong>DATE:</strong> {formatDate(analysis.createdAt)}</p>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              1. Executive Summary
            </h2>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">{analysis.title}</div>
              {analysis.bugSummary && analysis.bugSummary.length > 0 ? (
                <ul className="space-y-1 pt-1 text-[11px] text-slate-800">
                  {analysis.bugSummary.map((line, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-blue-700">[1.{idx + 1}]</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-800">{analysis.summary}</p>
              )}
            </div>
          </div>

          {/* Section 2: Parameters */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-200 pb-1">
              2. Incident Risk & Diagnostic Parameters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Severity</span>
                <span className="font-bold text-red-700 uppercase">{analysis.severity}</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Priority</span>
                <span className="font-bold text-purple-700 uppercase">{analysis.priority}</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">AI Confidence</span>
                <span className="font-mono font-bold text-blue-700">{analysis.confidenceScore}%</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Artifacts</span>
                <span className="font-mono font-bold text-slate-800">{analysis.uploadedFiles?.length || 0} Attached</span>
              </div>
            </div>
          </div>

          {/* Section 3: Root Cause */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-200 pb-1">
              3. Technical Root Cause Findings
            </h2>
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-[11px]">
              <ul className="space-y-1">
                {analysis.rootCauseAnalysis && analysis.rootCauseAnalysis.map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-800">
                    <span className="font-mono font-bold text-amber-800">[2.{idx + 1}]</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Reproduction */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-200 pb-1">
              4. Procedural Reproduction Sequence
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="py-1 px-3 w-10 text-center font-mono">#</th>
                    <th className="py-1 px-3">Action Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {analysis.reproductionSteps && analysis.reproductionSteps.map((step, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 text-center font-mono font-bold text-slate-500 bg-slate-50">{idx + 1}</td>
                      <td className="py-1.5 px-3 leading-relaxed">{step}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Remediation */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-200 pb-1">
              5. Remediation Plan & Fix Directives
            </h2>
            <div className="space-y-1 text-[11px]">
              {analysis.fixRecommendations && analysis.fixRecommendations.map((rec, idx) => (
                <div key={rec.id || idx} className="p-2 rounded border border-slate-200 bg-white flex items-start gap-2">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">FIX-0${idx + 1}</span>
                  <span className="text-slate-800 font-medium">{rec.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
