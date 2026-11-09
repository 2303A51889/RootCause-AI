import React, { useState } from 'react';
import { Copy, Check, FileCode, ArrowRight } from 'lucide-react';
import { SuggestedCodeFile } from '../../types';

export const CodeViewer: React.FC<{ file: SuggestedCodeFile }> = ({ file }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'fixed' | 'original'>('diff');

  const handleCopy = () => {
    navigator.clipboard.writeText(file.fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
      {/* File Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white font-mono">{file.name}</h4>
            <p className="text-[11px] text-slate-400 font-mono">{file.path}</p>
          </div>
        </div>

        {/* Tab Controls & Copy Action */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'diff'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Suggested Patch
            </button>
            <button
              onClick={() => setActiveTab('fixed')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'fixed'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fixed Code
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'original'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Original
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="px-4 py-2.5 bg-blue-950/40 border-b border-blue-900/40 text-blue-200 text-xs flex items-center gap-2">
        <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>{file.explanation}</span>
      </div>

      {/* Code Snippet Box */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-96">
        {activeTab === 'diff' && (
          <div className="space-y-1">
            <div className="text-slate-500 pb-2 border-b border-slate-800 select-none">
              // AI Code Comparison Patch
            </div>
            <pre className="bg-red-950/30 text-red-300 p-3 rounded-xl border border-red-900/30 whitespace-pre-wrap">
              <span className="text-red-400 select-none font-bold mr-2">-</span>
              {file.originalCode}
            </pre>
            <pre className="bg-emerald-950/30 text-emerald-300 p-3 rounded-xl border border-emerald-900/30 whitespace-pre-wrap">
              <span className="text-emerald-400 select-none font-bold mr-2">+</span>
              {file.fixedCode}
            </pre>
          </div>
        )}

        {activeTab === 'fixed' && (
          <pre className="text-emerald-300 whitespace-pre-wrap">{file.fixedCode}</pre>
        )}

        {activeTab === 'original' && (
          <pre className="text-slate-300 whitespace-pre-wrap">{file.originalCode}</pre>
        )}
      </div>
    </div>
  );
};
