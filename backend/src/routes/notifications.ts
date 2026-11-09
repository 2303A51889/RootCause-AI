import { Router } from 'express';
import Notification from '../models/Notification.js';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware.js';
import { requireDatabaseConnection } from '../middleware/databaseMiddleware.js';

const router = Router();

router.get('/', authMiddleware, requireDatabaseConnection, async (req: AuthRequest, res) => {
  const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  return res.json({ notifications });
});

router.patch('/read-all', authMiddleware, requireDatabaseConnection, async (req: AuthRequest, res) => {
  await Notification.updateMany({ userId: req.userId }, { $set: { read: true } });
  return res.json({ success: true });
});

router.patch('/:id/read', authMiddleware, requireDatabaseConnection, async (req: AuthRequest, res) => {
  const { id } = req.params;
  await Notification.updateOne({ _id: id, userId: req.userId }, { $set: { read: true } });
  return res.json({ success: true });
});

export default router;
