import fs from 'fs';
import path from 'path';
import AnalysisModel from '../models/Analysis.js';
import { buildPrompt } from './promptBuilderService.js';
import { callGemini } from './geminiService.js';
import { HttpError } from '../utils/httpError.js';
import { validateAiOutput } from '../validators/aiOutputValidator.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export async function runAnalysis(params: {
  title?: string;
  description?: string;
  files: Express.Multer.File[];
  userId: string;
  environmentDetails?: Record<string, unknown>;
}) {
  const { title, description, files = [], userId, environmentDetails = {} } = params;

  if (!userId) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Authenticated user is required');
  }

  if (!files || files.length === 0) {
    throw new HttpError(
      400,
      'MISSING_FILES',
      'Please upload at least one diagnostic file (bug report, log, stack trace, or source code).'
    );
  }

  // Check if any of the uploaded files are source code files (.js, .jsx, .tsx, .py, .java, .ts, .json, etc.)
  const hasSourceCode = files.some((file) =>
    /\.(js|jsx|tsx|py|java|ts|json|cpp|c|h|cs|go|rb|rs|php|swift|kt)$/i.test(file.originalname),
  );

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const parsedFiles = files.map((file, idx) => {
    const outPath = path.join(UPLOAD_DIR, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(outPath, file.buffer);

    // Check if the file is a known text file type (.js, .jsx, .tsx, .py, .java, .ts, .json, .log, .txt, .md, etc.)
    const isTextFile = /\.(js|jsx|tsx|py|java|ts|json|txt|log|html|css|c|cpp|h|cs|sh|yml|yaml|md|csv|xml)$/i.test(
      file.originalname,
    );
    const isCode = /\.(js|jsx|tsx|py|java|ts|json|cpp|c|h|cs|go|rb|rs|php|swift|kt)$/i.test(file.originalname);
    const isLog = /\.(log|txt)$/i.test(file.originalname);
    const category = isCode ? 'CODE_SNIPPET' : isLog ? 'LOGS' : 'BUG_REPORT';

    const contentSnippet = isTextFile
      ? file.buffer.toString('utf-8').slice(0, 4000)
      : `[File content: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)]`;

    return {
      id: `uf-${Date.now()}-${idx}`,
      name: file.originalname,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      category,
      progress: 100,
      status: 'completed',
      contentSnippet,
    };
  });

  const analysis = await AnalysisModel.create({
    userId,
    title: title || 'AI Analysis',
    description: description || '',
    status: 'processing',
    uploadedFiles: parsedFiles,
    environmentDetails,
  });

  try {
    const promptJson = buildPrompt({
      title,
      description,
      uploadedFiles: parsedFiles as any,
      additionalContext: { environment: environmentDetails },
      hasSourceCode,
    });

    const geminiOutput = await callGemini(promptJson);
    const validated = validateAiOutput(geminiOutput, hasSourceCode);

    analysis.status = 'completed';
    analysis.bugSummary = validated.bugSummary;
    analysis.summary = validated.bugSummary.join(' ');
    analysis.reproductionSteps = validated.reproductionSteps;
    analysis.rootCauseAnalysis = validated.rootCause;
    analysis.confidenceScore = validated.confidenceScore;
    analysis.confidenceReasoning = validated.confidenceReasoning;

    if (hasSourceCode && validated.suggestedFiles.length > 0) {
      analysis.suggestedFiles = validated.suggestedFiles.map((item) => ({
        name: item.name,
        path: item.path,
        language: item.language,
        originalCode: item.originalCode,
        fixedCode: item.fixedCode,
        explanation: item.explanation,
      }));
    } else {
      analysis.suggestedFiles = [];
    }

    if (!hasSourceCode) {
      analysis.fixRecommendations = [
        {
          id: `rec-${analysis.id}-0`,
          text: 'you have not uploaded any source code . please try again after uploading require code files',
          completed: false,
        },
      ];
    } else {
      analysis.fixRecommendations = validated.fixRecommendations.map((text, index) => ({
        id: `rec-${analysis.id}-${index}`,
        text,
        completed: false,
      }));
    }

    analysis.severity = validated.severity.toUpperCase();
    analysis.priority = validated.priority;
    analysis.severityReason = validated.severityReason;

    await analysis.save();
    return analysis;
  } catch (error: any) {
    analysis.status = 'failed';
    analysis.failureReason = error?.message || 'AI analysis failed';
    await analysis.save();
    throw error;
  }
}
