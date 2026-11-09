import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from './authMiddleware.js';
import { connectDB } from '../config/db.js';

/**
 * Middleware that ensures a MongoDB connection is available before proceeding.
 * If the connection is not ready, it attempts to establish one on-demand.
 * On failure, it returns a 503 Service Unavailable response.
 */
export async function requireDatabaseConnection(req: AuthRequest, res: Response, next: NextFunction) {
  // If Mongoose isn't connected yet, try to connect on-demand
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      // If connection still fails, respond with 503
      return res.status(503).json({
        success: false,
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database unavailable',
      });
    }
  }
  // Proceed to next middleware after ensuring DB is connected
  return next();
}
