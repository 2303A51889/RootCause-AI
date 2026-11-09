import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Trash2, ArrowRight, Clock, PlusCircle } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SeverityBadge } from '../components/analysis/SeverityBadge';
import { EmptyAnalyses } from '../components/empty/EmptyAnalyses';
import { Severity } from '../types';
import { formatDate } from '../lib/utils';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { analyses, deleteAnalysis } = useAnalysis();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'confidence' | 'severity'>('newest');

  // Filter & Sort Logic
  const filteredAnalyses = analyses
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'confidence') return b.confidenceScore - a.confidenceScore;
      if (sortBy === 'severity') {
        const severityRank: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return severityRank[b.severity] - severityRank[a.severity];
      }
      return 0;
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Top CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            Previous Analyses
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Browse, search, and manage your historical bug diagnoses.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/app/new-analysis')}
        >
          New Analysis
        </Button>
      </div>

      {/* Search, Filter Pills & Sort Selector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-soft">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bug title or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-xs rounded-2xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-[#111827] focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
                severityFilter === sev
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort by Newest</option>
            <option value="confidence">Sort by Confidence</option>
            <option value="severity">Sort by Severity</option>
          </select>
        </div>
      </div>

      {/* Grid of Analysis Cards */}
      {filteredAnalyses.length === 0 ? (
        <EmptyAnalyses
          searchActive={searchTerm !== '' || severityFilter !== 'ALL'}
          onResetSearch={() => {
            setSearchTerm('');
            setSeverityFilter('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAnalyses.map((item) => (
            <Card
              key={item.id}
              hoverable
              padded
              onClick={() => navigate(`/app/history/${item.id}`)}
              className="flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <SeverityBadge severity={item.severity} />
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {item.confidenceScore}% Match
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#111827] group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] line-clamp-2 mt-1">{item.summary}</p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {formatDate(item.createdAt)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAnalysis(item.id);
                    }}
                    title="Delete Analysis"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className="flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
