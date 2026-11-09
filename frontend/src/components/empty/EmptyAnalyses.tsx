import React from 'react';
import { FolderSearch, PlusCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const EmptyAnalyses: React.FC<{ searchActive?: boolean; onResetSearch?: () => void }> = ({
  searchActive = false,
  onResetSearch,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-[#E5E7EB] shadow-soft my-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
        <FolderSearch className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-[#111827]">
        {searchActive ? 'No matching analyses found' : 'No bug analyses yet'}
      </h3>
      <p className="text-xs text-[#6B7280] max-w-sm mt-1 mb-6">
        {searchActive
          ? 'Try adjusting your search term or severity filters to locate your bug report.'
          : 'Upload your first bug report, console log, or stack trace to diagnose root cause in seconds.'}
      </p>
      {searchActive ? (
        <Button variant="outline" size="sm" onClick={onResetSearch}>
          Clear Search Filters
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/app/new-analysis')}
        >
          Create First Bug Analysis
        </Button>
      )}
    </div>
  );
};
