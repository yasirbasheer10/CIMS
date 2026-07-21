const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');

router.use(authMiddleware);

// Multer for profile pictures
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// GET /api/users — list users (admin only)
router.get('/', adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, role, is_active, phone, designation, profile_image, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users — create user (admin only), supports multipart for optional avatar
router.post('/', adminOnly, avatarUpload.single('profile_image'), async (req, res) => {
  const { username, password, full_name, role = 'staff', fbr_password, phone, designation } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Username, password, and full name are required' });
  }
  if (!['admin', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin or staff' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const profileImage = req.file ? `/uploads/avatars/${req.file.filename}` : null;
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role, fbr_password, phone, designation, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, full_name, role, phone, designation, profile_image, created_at`,
      [username, hash, full_name, role, fbr_password || null, phone || null, designation || null, profileImage]
    );
    await auditLog(req.user.id, req.user.username, 'CREATE_USER', 'user', result.rows[0].id, { username, role });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Username already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/me — get current user's full profile
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, role, phone, designation, bio, profile_image, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/me — update own profile (name, phone, designation, bio)
router.patch('/me', avatarUpload.single('profile_image'), async (req, res) => {
  const { full_name, phone, designation, bio } = req.body;
  try {
    let query, params;
    if (req.file) {
      const profileImage = `/uploads/avatars/${req.file.filename}`;
      query = `UPDATE users SET full_name=$1, phone=$2, designation=$3, bio=$4, profile_image=$5, updated_at=NOW() WHERE id=$6
               RETURNING id, username, full_name, role, phone, designation, bio, profile_image`;
      params = [full_name || req.user.full_name, phone || null, designation || null, bio || null, profileImage, req.user.id];
    } else {
      query = `UPDATE users SET full_name=$1, phone=$2, designation=$3, bio=$4, updated_at=NOW() WHERE id=$5
               RETURNING id, username, full_name, role, phone, designation, bio, profile_image`;
      params = [full_name || req.user.full_name, phone || null, designation || null, bio || null, req.user.id];
    }
    const result = await pool.query(query, params);
    await auditLog(req.user.id, req.user.username, 'UPDATE_PROFILE', 'user', req.user.id, { full_name });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
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
