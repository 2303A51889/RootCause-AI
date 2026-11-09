import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware.js';
import { requireDatabaseConnection } from '../middleware/databaseMiddleware.js';
import User from '../models/User.js';

const router = Router();

router.put('/profile', authMiddleware, requireDatabaseConnection, async (req: AuthRequest, res) => {
  const userId = req.userId;
  const existing = userId ? await User.findById(userId) : null;
  if (!existing) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  const { name, role, organization } = req.body;
  existing.name = name || existing.name;
  existing.role = role || existing.role;
  existing.organization = organization || existing.organization;
  await existing.save();

  const { password: _, ...safeUser } = existing.toObject();
  return res.json({ user: safeUser });
});

export default router;
