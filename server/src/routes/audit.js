const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware, adminOnly);

// GET /api/audit?page=&limit=&action=&user_id=
router.get('/', async (req, res) => {
  const { page = 1, limit = 50, action, user_id, entity_type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (action) {
    conditions.push(`a.action = $${paramIndex++}`);
    params.push(action);
  }
  if (user_id) {
    conditions.push(`a.user_id = $${paramIndex++}`);
    params.push(parseInt(user_id));
  }
  if (entity_type) {
    conditions.push(`a.entity_type = $${paramIndex++}`);
    params.push(entity_type);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(`SELECT COUNT(*) FROM audit_log a ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT a.*, u.full_name as user_full_name
       FROM audit_log a
       LEFT JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.timestamp DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      logs: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
