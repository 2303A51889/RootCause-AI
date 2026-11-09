import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  PlusCircle,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FolderArchive,
  TrendingUp,
  ArrowRight,
  Clock,
  ChevronRight,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../context/AnalysisContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SeverityBadge } from '../components/analysis/SeverityBadge';
import { formatDate } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { analyses } = useAnalysis();

  // Statistics calculation
  const totalCount = analyses.length;
  const highCount = analyses.filter((a) => a.severity === 'HIGH').length;
  const mediumCount = analyses.filter((a) => a.severity === 'MEDIUM').length;
  const lowCount = analyses.filter((a) => a.severity === 'LOW').length;

  const recentAnalyses = analyses.slice(0, 4);

  return (
    <div className="space-y-8 pb-8">
      {/* Large Welcome Banner Card */}
      <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 relative overflow-hidden shadow-premium border-none">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Zap className="w-3 h-3 fill-current text-amber-300" />
              <span>RootCause AI Workspace Active</span>
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name.split(' ')[0] || 'Alex'} 👋
            </h1>
            <p className="text-blue-100 text-xs md:text-sm font-normal leading-relaxed">
              Your AI engine has analyzed{' '}
              <span className="font-bold text-white">{totalCount} bug reports</span> with an average
              confidence score of <span className="font-bold text-white">94%</span>.
            </p>
          </div>

          <Button
            variant="secondary"
            size="lg"
            leftIcon={<PlusCircle className="w-5 h-5 text-blue-600" />}
            onClick={() => navigate('/app/new-analysis')}
            className="shrink-0 bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-black/10"
          >
            Start New Bug Analysis
          </Button>
        </div>

        {/* Subtle background graphics */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </Card>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverable padded className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Total Analyses
            </p>
            <p className="text-3xl font-extrabold text-[#111827]">{totalCount}</p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <TrendingUp className="w-3 h-3" /> +12% this week
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <FolderArchive className="w-6 h-6" />
          </div>
        </Card>

        <Card hoverable padded className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              High Severity
            </p>
            <p className="text-3xl font-extrabold text-[#EF4444]">{highCount}</p>
            <span className="text-[11px] text-red-600 font-medium">Requires immediate patch</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>

        <Card hoverable padded className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Medium Severity
            </p>
            <p className="text-3xl font-extrabold text-[#F59E0B]">{mediumCount}</p>
            <span className="text-[11px] text-amber-600 font-medium">Scheduled for sprint</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        </Card>

        <Card hoverable padded className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Low Severity
            </p>
            <p className="text-3xl font-extrabold text-[#22C55E]">{lowCount}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Minor optimization</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Recent Analyses & System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide): Recent Analyses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111827] tracking-tight">Recent AI Analyses</h2>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => navigate('/app/history')}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentAnalyses.map((item) => (
              <Card
                key={item.id}
                hoverable
                padded
                onClick={() => navigate(`/app/history/${item.id}`)}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={item.severity} />
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {item.confidenceScore}% Confidence
                    </span>
                    <span className="text-xs text-[#6B7280] flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock className="w-3 h-3" /> {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#111827] truncate hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] line-clamp-1">{item.summary}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Details
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col wide): Analytics & Activity Feed */}
        <div className="space-y-6">
          {/* Chart Placeholder Widget */}
          <Card padded className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> Severity Breakdown
              </h3>
              <span className="text-[11px] text-[#6B7280]">All Time</span>
            </div>

            {/* Visual SVG Distribution Bar */}
            <div className="space-y-3">
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(highCount / totalCount) * 100}%` }}
                  className="bg-red-500 h-full"
                />
                <div
                  style={{ width: `${(mediumCount / totalCount) * 100}%` }}
                  className="bg-amber-500 h-full"
                />
                <div
                  style={{ width: `${(lowCount / totalCount) * 100}%` }}
                  className="bg-emerald-500 h-full"
                />
              </div>

              <div className="grid grid-cols-3 text-center text-xs pt-1">
                <div>
                  <p className="font-bold text-red-600">
                    {Math.round((highCount / totalCount) * 100)}%
                  </p>
                  <p className="text-[10px] text-[#6B7280]">High</p>
                </div>
                <div>
                  <p className="font-bold text-amber-600">
                    {Math.round((mediumCount / totalCount) * 100)}%
                  </p>
                  <p className="text-[10px] text-[#6B7280]">Medium</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-600">
                    {Math.round((lowCount / totalCount) * 100)}%
                  </p>
                  <p className="text-[10px] text-[#6B7280]">Low</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Feed Widget */}
          <Card padded className="space-y-4">
            <h3 className="text-sm font-bold text-[#111827] border-b border-[#E5E7EB] pb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" /> Recent AI Activity
            </h3>
            {recentAnalyses.length > 0 ? (
              <div className="space-y-3 text-xs">
                {recentAnalyses.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-[#111827]">{item.title}</p>
                      <p className="text-[10px] text-[#6B7280]">
                        {item.confidenceScore}% confidence • {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-[#6B7280]">
                No analyses have been created yet. Start a new analysis to populate this feed.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
