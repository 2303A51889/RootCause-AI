import mongoose, { Schema, Document } from 'mongoose';
import { AnalysisStatus } from '../types/index.js';

export interface IUploadedFile {
  id: string;
  name: string;
  size?: string;
  category?: string;
  progress?: number;
  status?: string;
  contentSnippet?: string;
}

export interface IFixRecommendation {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

export interface ISuggestedFile {
  name: string;
  path?: string;
  language?: string;
  originalCode?: string;
  fixedCode?: string;
  explanation?: string;
}

export interface IAnalysis extends Document {
  userId: string;
  title: string;
  description?: string;
  status: AnalysisStatus;
  uploadedFiles: IUploadedFile[];
  bugSummary?: string[];
  summary?: string;
  reproductionSteps?: string[];
  rootCauseAnalysis?: string[];
  confidenceScore?: number;
  confidenceReasoning?: string;
  suggestedFiles?: ISuggestedFile[];
  fixRecommendations?: IFixRecommendation[];
  severity?: string;
  priority?: string;
  severityReason?: string;
  failureReason?: string;
  environmentDetails?: {
    browser?: string;
    os?: string;
    runtime?: string;
    version?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UploadedFileSchema = new Schema<IUploadedFile>({
  id: String,
  name: String,
  size: String,
  category: String,
  progress: Number,
  status: String,
  contentSnippet: String,
});

const FixRecommendationSchema = new Schema<IFixRecommendation>({
  id: String,
  text: String,
  completed: Boolean,
  category: String,
});

const SuggestedFileSchema = new Schema<ISuggestedFile>({
  name: String,
  path: String,
  language: String,
  originalCode: String,
  fixedCode: String,
  explanation: String,
});

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing', index: true },
    uploadedFiles: [UploadedFileSchema],
    bugSummary: [String],
    summary: { type: String },
    reproductionSteps: [String],
    rootCauseAnalysis: [String],
    confidenceScore: Number,
    confidenceReasoning: String,
    suggestedFiles: [SuggestedFileSchema],
    fixRecommendations: [FixRecommendationSchema],
    severity: String,
    priority: String,
    severityReason: String,
    failureReason: String,
    environmentDetails: {
      browser: String,
      os: String,
      runtime: String,
      version: String,
    },
  },
  { timestamps: true },
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ severity: 1 });
AnalysisSchema.index({ createdAt: -1 });

export default mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
