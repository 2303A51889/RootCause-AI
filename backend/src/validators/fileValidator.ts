import path from 'path';
import { HttpError } from '../utils/httpError.js';
import { FileCategory } from '../types/index.js';

const allowedExtensions = new Set([
  '.log',
  '.txt',
  '.md',
  '.json',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.java',
  '.png',
  '.jpg',
  '.jpeg',
  '.pdf',
]);

const allowedMimeTypes = new Set([
  'text/plain',
  'application/json',
  'text/markdown',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/octet-stream',
  'text/x-python',
  'application/javascript',
  'text/javascript',
]);

export function sanitizeFilename(name: string) {
  const baseName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!baseName || baseName === '.' || baseName === '..') {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Invalid filename');
  }
  return baseName;
}

export function validateUploadedFile(file: Express.Multer.File) {
  const safeName = sanitizeFilename(file.originalname);
  const ext = path.extname(safeName).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `Unsupported file type: ${ext || 'unknown'}`);
  }

  if (file.mimetype && !allowedMimeTypes.has(file.mimetype) && !file.mimetype.startsWith('text/')) {
    throw new HttpError(400, 'VALIDATION_ERROR', `Unsupported MIME type: ${file.mimetype}`);
  }

  return {
    ...file,
    originalname: safeName,
  };
}

export function normalizeCategory(category?: string): FileCategory {
  const allowed: FileCategory[] = [
    'BUG_REPORT',
    'LOGS',
    'STACK_TRACE',
    'SCREENSHOT',
    'CODE_SNIPPET',
    'ENVIRONMENT',
  ];
  if (category && allowed.includes(category as FileCategory)) {
    return category as FileCategory;
  }
  return 'STACK_TRACE';
}
