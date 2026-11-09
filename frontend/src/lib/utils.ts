import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Severity, Priority } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getSeverityStyles(severity: Severity) {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-100 text-red-800 border-red-300 font-bold',
        badge: 'bg-red-600 text-white',
        dot: 'bg-red-600',
      };
    case 'HIGH':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        badge: 'bg-red-500 text-white',
        dot: 'bg-red-500',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-500 text-white',
        dot: 'bg-amber-500',
      };
    case 'LOW':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-500 text-white',
        dot: 'bg-emerald-500',
      };
    default:
      return {
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        badge: 'bg-gray-500 text-white',
        dot: 'bg-gray-500',
      };
  }
}

export function getPriorityStyles(priority: Priority) {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'HIGH':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'LOW':
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'BUG_REPORT':
      return 'Bug Report';
    case 'LOGS':
      return 'Console Logs';
    case 'STACK_TRACE':
      return 'Stack Trace';
    case 'SCREENSHOT':
      return 'Screenshot';
    case 'CODE_SNIPPET':
      return 'Code Snippet';
    case 'ENVIRONMENT':
      return 'Environment';
    default:
      return category;
  }
}
