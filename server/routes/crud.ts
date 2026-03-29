import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const createViewset = (tableName: string) => {
  router.get(`/${tableName}`, authenticateToken, (req: any, res) => {
    if (tableName === 'events') {
      if (req.user.role === 'TEACHER') {
        const items = db.prepare('SELECT * FROM events WHERE teacher_id = ?').all(req.user.id);
        return res.json(items);
      } else {
        const user: any = db.prepare('SELECT group_id FROM users WHERE id = ?').get(req.user.id);
        if (!user || !user.group_id) return res.json([]);
        const items = db.prepare('SELECT * FROM events WHERE group_id = ? ORDER BY date DESC, time DESC').all(user.group_id);
        return res.json(items);
      }
    }
    const items = db.prepare(`SELECT * FROM ${tableName}`).all();
    res.json(items);
  });

  router.get(`/${tableName}/:id`, authenticateToken, (req, res) => {
    const item = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });

  router.post(`/${tableName}`, authenticateToken, (req: any, res) => {
    if (req.user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can create resources' });
    
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = keys.map(() => '?').join(',');
    try {
      const stmt = db.prepare(`INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`);
      const result = stmt.run(...values);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Invalid data' });
    }
  });

  router.put(`/${tableName}/:id`, authenticateToken, (req: any, res) => {
    if (req.user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can update resources' });
    
    const keys = Object.keys(req.body);
    if (keys.length === 0) return res.status(400).json({ error: 'No data provided' });
    
    const values = [...Object.values(req.body), req.params.id];
    const setClause = keys.map(k => `${k} = ?`).join(',');
    try {
      db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`).run(...values);
      res.json({ message: 'Updated' });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Update failed' });
    }
  });

  router.delete(`/${tableName}/:id`, authenticateToken, (req: any, res) => {
    if (req.user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can delete resources' });
    
    try {
      db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(req.params.id);
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Delete failed' });
    }
  });
};

['rooms', 'groups', 'events'].forEach(createViewset);

export default router;
