import React from 'react';
import { Severity } from '../../types';
import { getSeverityStyles } from '../../lib/utils';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const styles = getSeverityStyles(severity);

  const getIcon = () => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-700 animate-pulse" />;
      case 'HIGH':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      case 'MEDIUM':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      case 'LOW':
        return <Info className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles.bg}`}
    >
      {getIcon()}
      <span>{severity} SEVERITY</span>
    </span>
  );
};
