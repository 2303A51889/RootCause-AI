export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FileCategory =
  'BUG_REPORT' | 'LOGS' | 'STACK_TRACE' | 'SCREENSHOT' | 'CODE_SNIPPET' | 'ENVIRONMENT';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  category: FileCategory;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  previewUrl?: string;
  contentSnippet?: string;
  file?: File;
}

export interface SuggestedCodeFile {
  name: string;
  path: string;
  language: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
}

export interface FixRecommendation {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

export interface BugAnalysis {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  severity: Severity;
  priority: Priority;
  confidenceScore: number;
  confidenceSummary: string;
  summary: string;
  bugSummary?: string[];
  reproductionSteps: string[];
  rootCauseAnalysis: string[];
  suggestedFiles: SuggestedCodeFile[];
  fixRecommendations: FixRecommendation[];
  uploadedFiles: UploadedFileItem[];
  environmentDetails?: {
    browser?: string;
    os?: string;
    runtime?: string;
    version?: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  organization: string;
  password?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'danger';
  analysisId?: string;
}
