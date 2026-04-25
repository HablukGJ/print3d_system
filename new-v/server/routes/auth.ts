import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { getJWTSecret } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    stmt.run(email, hashedPassword, name, role);
    res.status(201).json({ message: 'User registered' });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, getJWTSecret());
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

export default router;
