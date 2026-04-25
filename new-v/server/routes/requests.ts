import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all requests (Admin) or my requests (User)
router.get('/', authenticateToken, (req: any, res) => {
  try {
    // Auto-archive requests older than 7 days
    db.prepare(`
      UPDATE print_requests
      SET status = 'archived'
      WHERE status != 'archived' 
      AND created_at < datetime('now', '-7 days')
    `).run();

    if (req.user.role === 'ADMIN') {
      const requests = db.prepare(`
        SELECT r.*, u.email as user_email
        FROM print_requests r
               JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `).all();
      res.json(requests);
    } else {
      const requests = db.prepare('SELECT * FROM print_requests WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
      res.json(requests);
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Create a new request
router.post('/', authenticateToken, upload.single('drawing'), (req: any, res) => {
  const { full_name, student_group, comment } = req.body;
  if (!full_name || !student_group) {
    return res.status(400).json({ error: 'FIO and group are required' });
  }

  const file_path = req.file ? req.file.path : null;
  const file_original_name = req.file ? req.file.originalname : null;

  try {
    const stmt = db.prepare('INSERT INTO print_requests (user_id, full_name, student_group, comment, file_path, file_original_name) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(req.user.id, full_name, student_group, comment, file_path, file_original_name);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Update request status (Admin or User archiving their own)
router.patch('/:id/status', authenticateToken, (req: any, res) => {
  const { status } = req.body;
  const requestId = req.params.id;

  if (!['pending', 'processing', 'completed', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // If user is not admin, they can only change status to 'archived' for their own requests
    if (req.user.role !== 'ADMIN') {
      if (status !== 'archived') {
        return res.status(403).json({ error: 'Users can only archive their own requests' });
      }
      const result = db.prepare('UPDATE print_requests SET status = ? WHERE id = ? AND user_id = ?').run(status, requestId, req.user.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Request not found or permission denied' });
      }
    } else {
      const result = db.prepare('UPDATE print_requests SET status = ? WHERE id = ?').run(status, requestId);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
    }
    res.json({ message: 'Status updated' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
