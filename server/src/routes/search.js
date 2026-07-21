const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/search?q=&name=&cnic=&mobile=&email=&city=&employer=&ntn=&strn=&page=&limit=
router.get('/', async (req, res) => {
  const { q, name, cnic, mobile, email, city, province, employer, ntn, strn, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = [`c.is_archived = false`];
  const params = [];
  let paramIndex = 1;

  // Global quick search
  if (q) {
    const qStripped = q.replace(/-/g, '');
    conditions.push(`(
      c.full_name ILIKE $${paramIndex} OR
      c.father_husband_name ILIKE $${paramIndex} OR
      REPLACE(c.cnic, '-', '') ILIKE $${paramIndex} OR
      c.mobile ILIKE $${paramIndex} OR
      c.alt_phone ILIKE $${paramIndex} OR
      c.email ILIKE $${paramIndex} OR
      c.employer ILIKE $${paramIndex} OR
      c.ntn ILIKE $${paramIndex} OR
      c.strn ILIKE $${paramIndex} OR
      c.city ILIKE $${paramIndex}
    )`);
    params.push(`%${qStripped}%`);
    paramIndex++;
  }

  // Field-specific filters
  const fieldFilters = [
    { field: 'full_name', value: name, like: true },
    { field: 'cnic', value: cnic, like: true, replaceDashes: true },
    { field: 'mobile', value: mobile, like: true },
    { field: 'email', value: email, like: true },
    { field: 'city', value: city, like: true },
    { field: 'province', value: province, like: true },
    { field: 'employer', value: employer, like: true },
    { field: 'ntn', value: ntn, like: true },
    { field: 'strn', value: strn, like: true },
  ];

  for (const filter of fieldFilters) {
    if (filter.value) {
      if (filter.replaceDashes) {
        conditions.push(`REPLACE(c.${filter.field}, '-', '') ILIKE $${paramIndex}`);
        params.push(`%${filter.value.replace(/-/g, '')}%`);
      } else {
        conditions.push(`c.${filter.field} ILIKE $${paramIndex}`);
        params.push(`%${filter.value}%`);
      }
      paramIndex++;
    }
  }

  const whereClause = conditions.join(' AND ');

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM clients c WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.id, c.full_name, c.cnic, c.mobile, c.email, c.city, c.province, c.employer, c.ntn, c.created_at
       FROM clients c
       WHERE ${whereClause}
       ORDER BY c.full_name ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      results: result.rows,
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

module.exports = router;
