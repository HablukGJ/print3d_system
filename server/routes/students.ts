import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'TEACHER') return res.sendStatus(403);
  const students = db.prepare("SELECT id, email, name, group_id FROM users WHERE role = 'STUDENT'").all();
  res.json(students);
});

router.get('/group/:id', authenticateToken, (req, res) => {
  const students = db.prepare("SELECT id, email, name FROM users WHERE group_id = ? AND role = 'STUDENT'").all(req.params.id);
  res.json(students);
});

router.patch('/:id/group', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'TEACHER') return res.sendStatus(403);
  const { group_id } = req.body;
  db.prepare("UPDATE users SET group_id = ? WHERE id = ? AND role = 'STUDENT'").run(group_id || null, req.params.id);
  res.json({ message: 'Student group updated' });
});

export default router;
