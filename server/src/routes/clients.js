const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');

// All routes require auth
router.use(authMiddleware);

// GET /api/clients — list all clients (paginated)
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, archived = 'false', sort = 'created_at', order = 'desc' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const isArchived = archived === 'true';
  const allowedSort = ['full_name', 'created_at', 'updated_at', 'city', 'cnic'];
  const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM clients WHERE is_archived = $1`,
      [isArchived]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.*, u1.full_name as created_by_name, u2.full_name as updated_by_name
       FROM clients c
       LEFT JOIN users u1 ON c.created_by = u1.id
       LEFT JOIN users u2 ON c.updated_by = u2.id
       WHERE c.is_archived = $1
       ORDER BY c.${sortCol} ${sortOrder}
       LIMIT $2 OFFSET $3`,
      [isArchived, parseInt(limit), offset]
    );

    res.json({
      clients: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/clients/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [total, archived, recentClients, recentUpdates] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM clients WHERE is_archived = false`),
      pool.query(`SELECT COUNT(*) FROM clients WHERE is_archived = true`),
      pool.query(
        `SELECT id, full_name, cnic, mobile, city, created_at FROM clients WHERE is_archived = false ORDER BY created_at DESC LIMIT 5`
      ),
      pool.query(
        `SELECT id, full_name, cnic, mobile, city, updated_at FROM clients WHERE is_archived = false ORDER BY updated_at DESC LIMIT 5`
      ),
    ]);

    res.json({
      total_clients: parseInt(total.rows[0].count),
      archived_clients: parseInt(archived.rows[0].count),
      recent_clients: recentClients.rows,
      recent_updates: recentUpdates.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/clients/:id — single client
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u1.full_name as created_by_name, u2.full_name as updated_by_name
       FROM clients c
       LEFT JOIN users u1 ON c.created_by = u1.id
       LEFT JOIN users u2 ON c.updated_by = u2.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/clients — create client
router.post('/', async (req, res) => {
  const {
    full_name, father_husband_name, cnic, dob, gender, nationality,
    mobile, alt_phone, email, current_address, permanent_address, city, province,
    occupation, employer, ntn, strn, tax_remarks, legal_remarks, internal_comments,
  } = req.body;

  if (!full_name) return res.status(400).json({ error: 'Full name is required' });

  try {
    const result = await pool.query(
      `INSERT INTO clients (
        full_name, father_husband_name, cnic, dob, gender, nationality,
        mobile, alt_phone, email, current_address, permanent_address, city, province,
        occupation, employer, ntn, strn, tax_remarks, legal_remarks, internal_comments,
        created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$21)
      RETURNING *`,
      [
        full_name, father_husband_name, cnic || null, dob || null, gender, nationality || 'Pakistani',
        mobile, alt_phone, email, current_address, permanent_address, city, province,
        occupation, employer, ntn || null, strn || null, tax_remarks, legal_remarks, internal_comments,
        req.user.id,
      ]
    );

    const client = result.rows[0];
    await auditLog(req.user.id, req.user.username, 'CREATE_CLIENT', 'client', client.id, { full_name });

    res.status(201).json(client);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'A client with this CNIC already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/clients/:id — update client
router.put('/:id', async (req, res) => {
  const {
    full_name, father_husband_name, cnic, dob, gender, nationality,
    mobile, alt_phone, email, current_address, permanent_address, city, province,
    occupation, employer, ntn, strn, tax_remarks, legal_remarks, internal_comments,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE clients SET
        full_name=$1, father_husband_name=$2, cnic=$3, dob=$4, gender=$5, nationality=$6,
        mobile=$7, alt_phone=$8, email=$9, current_address=$10, permanent_address=$11,
        city=$12, province=$13, occupation=$14, employer=$15, ntn=$16, strn=$17,
        tax_remarks=$18, legal_remarks=$19, internal_comments=$20,
        updated_by=$21, updated_at=NOW()
       WHERE id=$22
       RETURNING *`,
      [
        full_name, father_husband_name, cnic || null, dob || null, gender, nationality,
        mobile, alt_phone, email, current_address, permanent_address, city, province,
        occupation, employer, ntn || null, strn || null, tax_remarks, legal_remarks, internal_comments,
        req.user.id, req.params.id,
      ]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'Client not found' });
    await auditLog(req.user.id, req.user.username, 'UPDATE_CLIENT', 'client', parseInt(req.params.id), { full_name });

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'A client with this CNIC already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/clients/:id/archive — archive/restore
router.patch('/:id/archive', async (req, res) => {
  const { archive } = req.body; // true or false
  try {
    const result = await pool.query(
      `UPDATE clients SET is_archived=$1, updated_by=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [archive, req.user.id, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Client not found' });

    const action = archive ? 'ARCHIVE_CLIENT' : 'RESTORE_CLIENT';
    await auditLog(req.user.id, req.user.username, action, 'client', parseInt(req.params.id), {});

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/clients/:id — hard delete (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM clients WHERE id=$1 RETURNING id, full_name`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Client not found' });

    await auditLog(req.user.id, req.user.username, 'DELETE_CLIENT', 'client', parseInt(req.params.id), { full_name: result.rows[0].full_name });

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
