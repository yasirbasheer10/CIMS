const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');

router.use(authMiddleware);

// GET /api/users — list users (admin only)
router.get('/', adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users — create user (admin only)
router.post('/', adminOnly, async (req, res) => {
  const { username, password, full_name, role = 'staff' } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Username, password, and full name are required' });
  }
  if (!['admin', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin or staff' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role, created_at`,
      [username, hash, full_name, role]
    );
    await auditLog(req.user.id, req.user.username, 'CREATE_USER', 'user', result.rows[0].id, { username, role });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id — update user (admin only)
router.put('/:id', adminOnly, async (req, res) => {
  const { full_name, role, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET full_name=$1, role=$2, is_active=$3, updated_at=NOW() WHERE id=$4
       RETURNING id, username, full_name, role, is_active`,
      [full_name, role, is_active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    await auditLog(req.user.id, req.user.username, 'UPDATE_USER', 'user', parseInt(req.params.id), { full_name, role, is_active });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/:id/reset-password — admin resets password
router.patch('/:id/reset-password', adminOnly, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const hash = await bcrypt.hash(new_password, 12);
    await pool.query(`UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [hash, req.params.id]);
    await auditLog(req.user.id, req.user.username, 'RESET_USER_PASSWORD', 'user', parseInt(req.params.id), {});
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
