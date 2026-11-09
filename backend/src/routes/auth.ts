import { Router } from 'express';
import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import User from '../models/User.js';
import PendingRegistration from '../models/PendingRegistration.js';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

function assertMongoReady() {
  if (mongoose.connection.readyState !== 1) {
    throw Object.assign(new Error('Database unavailable'), { statusCode: 503, code: 'DATABASE_UNAVAILABLE' });
  }
}

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in the environment.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: (process.env.SMTP_PORT || '587') === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@rootcause.ai';

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'RootCause AI registration verification',
    html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });
};

router.post('/register', async (req, res) => {
  try {
    assertMongoReady();
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const otp = `${randomInt(0, 1000000).toString().padStart(6, '0')}`;
    const otpHash = await bcrypt.hash(otp, 12);

    await PendingRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        name: String(name).trim(),
        passwordHash,
        otpHash,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attemptCount: 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await sendOtpEmail(normalizedEmail, otp);

    return res.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email. Please verify it to continue.',
      ...(process.env.NODE_ENV !== 'production' ? { debugOtp: otp } : {}),
    });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    const message = err?.message || 'Registration failed';
    return res.status(statusCode).json({ success: false, code: err?.code || 'INTERNAL_SERVER_ERROR', message });
  }
});

router.post('/register/verify', async (req, res) => {
  try {
    assertMongoReady();
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const pending = await PendingRegistration.findOne({ email: normalizedEmail });
    if (!pending) {
      return res.status(404).json({ success: false, message: 'No pending registration found for this email' });
    }

    if (Date.now() > pending.otpExpiresAt.getTime()) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      return res.status(410).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    const otpMatch = await bcrypt.compare(String(otp).trim(), pending.otpHash);
    if (!otpMatch) {
      await PendingRegistration.updateOne({ _id: pending._id }, { $inc: { attemptCount: 1 } });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const user = await User.create({ name: pending.name, email: pending.email, password: pending.passwordHash });
    await PendingRegistration.deleteOne({ _id: pending._id });

    const token = generateToken({ userId: user.id, email: user.email });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    const { password: _, ...safeUser } = user.toObject();
    return res.json({ success: true, token, user: safeUser, message: 'Account created successfully' });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    return res.status(statusCode).json({ success: false, code: err?.code || 'INTERNAL_SERVER_ERROR', message: err?.message || 'Verification failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    assertMongoReady();
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken({ userId: user.id, email: user.email });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    const { password: _, ...safeUser } = user.toObject();
    return res.json({ success: true, token, user: safeUser });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    return res.status(statusCode).json({ success: false, code: err?.code || 'INTERNAL_SERVER_ERROR', message: err?.message || 'Login failed' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out' });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    assertMongoReady();
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password: _, ...safeUser } = user as any;
    return res.json({ success: true, user: safeUser });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    return res.status(statusCode).json({ success: false, code: err?.code || 'INTERNAL_SERVER_ERROR', message: err?.message || 'Unable to load user' });
  }
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  return res.json({ success: true, message: `If an account exists for ${email}, a reset link would be sent.` });
});

export default router;
