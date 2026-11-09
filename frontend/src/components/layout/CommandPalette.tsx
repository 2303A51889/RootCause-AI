import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  LayoutDashboard,
  FolderArchive,
  Settings,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAnalysis } from '../../context/AnalysisContext';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { analyses } = useAnalysis();

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  const filteredAnalyses = analyses.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.summary.toLowerCase().includes(query.toLowerCase()),
  );

  const quickLinks = [
    { label: 'New Bug Analysis', path: '/app/new-analysis', icon: PlusCircle },
    { label: 'Go to Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'View Previous Analyses', path: '/app/history', icon: FolderArchive },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative flex items-center border-b border-[#E5E7EB] pb-3">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search bug reports, stack traces..."
            className="w-full text-base bg-transparent text-[#111827] placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Results Section */}
        <div className="max-h-80 overflow-y-auto space-y-4 py-2">
          {query.trim() === '' ? (
            <div>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                Quick Commands
              </p>
              <div className="space-y-1">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleSelect(link.path)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50 text-left transition-colors text-sm text-[#111827] group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                Matching Bug Analyses ({filteredAnalyses.length})
              </p>
              {filteredAnalyses.length === 0 ? (
                <p className="text-xs text-[#6B7280] py-4 text-center">
                  No matching bug analyses found.
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredAnalyses.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(`/app/history/${item.id}`)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50 text-left transition-colors text-xs text-[#111827] group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[#6B7280] truncate text-[11px]">{item.summary}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        {item.severity}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
