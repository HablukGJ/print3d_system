import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/event/:id', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'TEACHER') return res.sendStatus(403);
  const grades = db.prepare('SELECT g.*, u.name as student_name FROM grades g JOIN users u ON g.student_id = u.id WHERE g.event_id = ?').all(req.params.id);
  res.json(grades);
});

router.post('/', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'TEACHER') return res.sendStatus(403);
  const { event_id, student_id, grade, comment } = req.body;
  const stmt = db.prepare(`
    INSERT INTO grades (event_id, student_id, grade, comment)
    VALUES (?, ?, ?, ?)
      ON CONFLICT(event_id, student_id) DO UPDATE SET
      grade = excluded.grade,
                                             comment = excluded.comment
  `);
  stmt.run(event_id, student_id, grade, comment);
  res.json({ message: 'Grade saved' });
});

router.get('/my', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'STUDENT') return res.sendStatus(403);
  const grades = db.prepare(`
    SELECT g.*, e.date, e.time, e.description, u.name as teacher_name
    FROM grades g
           JOIN events e ON g.event_id = e.id
           JOIN users u ON e.teacher_id = u.id
    WHERE g.student_id = ?
    ORDER BY e.date DESC, e.time DESC
  `).all(req.user.id);
  res.json(grades);
});

export default router;
