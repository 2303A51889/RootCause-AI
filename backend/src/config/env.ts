export interface BackendConfig {
  port: number;
  mongoUri: string;
  geminiApiKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  jwtSecret: string;
  jwtExpiry: string;
  corsOrigin: string;
}

function requireValue(name: string, value: string | undefined): string {
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

export function loadBackendConfig(): BackendConfig {
  const port = Number(process.env.PORT || 5000);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error('PORT must be a positive number');
  }

  return {
    port,
    mongoUri: requireValue('MONGODB_URI', process.env.MONGODB_URI),
    geminiApiKey: requireValue('GEMINI_API_KEY', process.env.GEMINI_API_KEY),
    smtpHost: requireValue('SMTP_HOST', process.env.SMTP_HOST),
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: requireValue('SMTP_USER', process.env.SMTP_USER),
    smtpPass: requireValue('SMTP_PASS', process.env.SMTP_PASS),
    smtpFrom: process.env.SMTP_FROM?.trim() || requireValue('SMTP_FROM', process.env.SMTP_USER),
    jwtSecret: requireValue('JWT_SECRET', process.env.JWT_SECRET),
    jwtExpiry: process.env.JWT_EXPIRY?.trim() || '7d',
    corsOrigin: requireValue('CORS_ORIGIN', process.env.CORS_ORIGIN),
  };
}
