import { IUploadedFile } from '../models/Analysis.js';

/**
 * Build a structured JSON prompt for the Gemini model from uploaded files and text inputs.
 * Follows the strict rule: Input evidence → Analysis → Evidence-backed conclusion.
 */
export function buildPrompt(params: {
  title?: string;
  description?: string;
  uploadedFiles?: IUploadedFile[];
  additionalContext?: Record<string, any>;
  hasSourceCode?: boolean;
}) {
  const { title, description, uploadedFiles = [], additionalContext = {}, hasSourceCode = false } = params;

  // Compile information about files
  const fileDetails = uploadedFiles.map((f) => {
    return {
      name: f.name,
      contentSnippet: f.contentSnippet || '',
    };
  });

  const sourceCodeInstruction = hasSourceCode
    ? "Source code files ARE attached. You MUST provide detailed code patch suggestions in 'suggestedFiles' containing the exact buggy original snippet in 'originalCode' and the corrected fix in 'fixedCode'."
    : "Source code files are NOT attached. Strictly follow the rule: do NOT guess or generate suggested patches/files. Instead, set 'fixRecommendations' to ['you have not uploaded any source code . please try again after uploading require code files'] and 'suggestedFiles' to an empty array [].";

  return {
    task: `Perform an evidence-backed root cause analysis following this strict rule: Input evidence → Analysis → Evidence-backed conclusion. Base your findings strictly on the provided log files, bug reports, and code snippets. Executive summary MUST produce 3 to 6 lines. AI confidence score must NEVER be 100% (realistic range 70-95%). ${sourceCodeInstruction}`,
    bugReport: {
      title: title || 'N/A',
      description: description || 'N/A',
    },
    attachedFiles: fileDetails,
    environment: additionalContext.environment || {},
    responseSchema: {
      instructions: "You must output a single JSON object. Do not wrap the JSON in markdown code blocks. The JSON must exactly match the schema below. Every array and field is required.",
      schema: {
        bugSummary: "An array of 3 to 6 strings. Each string must be a concise, insightful line (total 3-6 lines) that together form the Executive Summary of the incident, impact, and observation.",
        reproductionSteps: "An array of 3 to 8 strings. Steps to reproduce the bug.",
        rootCause: "An array of 2 to 3 strings. Bullet points describing the fundamental technical reason(s) for the bug.",
        confidenceScore: "A realistic number between 70 and 95 (NEVER 100%). Diagnostic confidence must reflect realistic engineering probabilities.",
        confidenceReasoning: "A string explaining why you have this confidence level based on the evidence.",
        suggestedFiles: hasSourceCode 
          ? [
              {
                name: "Filename (e.g. authService.ts or App.jsx)",
                path: "Relative file path (e.g. src/services/authService.ts)",
                language: "Programming language (e.g. typescript, javascript, python, java)",
                originalCode: "The exact buggy or problematic code snippet identified from uploaded files",
                fixedCode: "The corrected and verified code fix snippet resolving the bug",
                explanation: "Specific technical explanation of the fix and why it resolves the issue"
              }
            ]
          : "An empty array [].",
        fixRecommendations: hasSourceCode
          ? "An array of 3 to 4 strings. Practical, step-by-step code and design fixes."
          : "An array containing exactly: ['you have not uploaded any source code . please try again after uploading require code files'].",
        severity: "Must be exactly one of: 'Critical', 'High', 'Medium', 'Low'.",
        priority: "Must be exactly one of: 'P0', 'P1', 'P2', 'P3'.",
        severityReason: "A string explaining why this severity rating was chosen."
      }
    }
  };
}
