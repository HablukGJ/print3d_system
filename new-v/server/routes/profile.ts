import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.patch('/', authenticateToken, (req: any, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, req.user.id);
    const updatedUser: any = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(req.user.id);
    res.json(updatedUser);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.delete('/', authenticateToken, (req: any, res) => {
  try {
    // Delete associated print requests first
    db.prepare('DELETE FROM print_requests WHERE user_id = ?').run(req.user.id);
    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
