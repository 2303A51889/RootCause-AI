import { Router } from 'express';
import multer from 'multer';
import Analysis from '../models/Analysis.js';
import Notification from '../models/Notification.js';
import { runAnalysis } from '../services/analysisService.js';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware.js';
import { requireDatabaseConnection } from '../middleware/databaseMiddleware.js';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', authMiddleware, requireDatabaseConnection, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { search, severity, sortBy } = req.query;
  let query: Record<string, unknown> = { userId };

  if (severity && typeof severity === 'string' && severity !== 'ALL') {
    query.severity = severity;
  }

  let list = await Analysis.find(query).lean();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((item) => item.title.toLowerCase().includes(q) || (item.summary || '').toLowerCase().includes(q));
  }

  if (sortBy === 'confidence') {
    list.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
  } else if (sortBy === 'severity') {
    const rank: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    list.sort((a, b) => (rank[String(b.severity)] || 0) - (rank[String(a.severity)] || 0));
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ analyses: list });
});

router.get('/:id', authMiddleware, requireDatabaseConnection, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const item = await Analysis.findOne({ _id: id, userId: req.userId }).lean();
  if (!item) {
    return res.status(404).json({ error: 'Analysis report not found' });
  }
  return res.json({ analysis: item });
});

router.post('/', authMiddleware, requireDatabaseConnection, upload.array('files'), async (req: AuthRequest, res) => {
  const { title, description, environmentDetails } = req.body;
  const files = (req.files as Express.Multer.File[]) || [];
  try {
    const doc = await runAnalysis({
      userId: req.userId || '',
      title,
      description,
      files,
      environmentDetails: environmentDetails ? JSON.parse(environmentDetails) : {},
    });

    await Notification.create({
      userId: req.userId,
      title: 'Analysis Completed',
      message: `AI Analysis for "${doc.title}" generated with ${doc.confidenceScore}% confidence.`,
      timestamp: 'Just now',
      read: false,
      type: 'success',
      analysisId: doc.id,
    });

    return res.status(201).json({ analysis: doc });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    const message = err?.message || 'Analysis pipeline failed';
    const code = err?.code || 'ANALYSIS_FAILED';
    return res.status(statusCode).json({ success: false, error: message, code });
  }
});

router.delete('/:id', authMiddleware, requireDatabaseConnection, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const deleted = await Analysis.deleteOne({ _id: id, userId: req.userId });
  if (deleted.deletedCount === 0) {
    return res.status(404).json({ error: 'Analysis report not found' });
  }
  return res.json({ success: true });
});

router.patch('/:id/checklist/:recId', authMiddleware, requireDatabaseConnection, async (req: AuthRequest, res) => {
  const { id, recId } = req.params;
  const updated = await Analysis.findOneAndUpdate(
    { _id: id, userId: req.userId, 'fixRecommendations.id': recId },
    { $set: { 'fixRecommendations.$.completed': true } },
    { new: true },
  );
  if (!updated) {
    return res.status(404).json({ error: 'Analysis or recommendation item not found' });
  }
  return res.json({ analysis: updated });
});

export default router;
