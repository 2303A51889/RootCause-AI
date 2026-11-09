import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function getSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  return secret;
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const decoded: any = jwt.verify(token, getSecret());
    req.userEmail = decoded.email;
    req.userId = decoded.userId;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function generateToken(payload: { userId: string; email: string }) {
  const expiresIn = process.env.JWT_EXPIRY || '7d';
  return jwt.sign({ userId: payload.userId, email: payload.email }, getSecret(), { expiresIn: expiresIn as any });
}
