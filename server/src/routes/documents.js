const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');

router.use(authMiddleware);

const uploadDir = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const clientDir = path.join(uploadDir, `client_${req.params.clientId}`);
    if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });
    cb(null, clientDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

// GET /api/documents/:clientId — list documents
router.get('/:clientId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.full_name as uploaded_by_name
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.client_id = $1
       ORDER BY d.uploaded_at DESC`,
      [req.params.clientId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/documents/:clientId — upload document
router.post('/:clientId', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { category = 'other' } = req.body;
  const relPath = `client_${req.params.clientId}/${req.file.filename}`;

  try {
    const result = await pool.query(
      `INSERT INTO documents (client_id, filename, original_name, mimetype, size, category, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.clientId, relPath, req.file.originalname, req.file.mimetype, req.file.size, category, req.user.id]
    );

    await auditLog(req.user.id, req.user.username, 'UPLOAD_DOCUMENT', 'document', result.rows[0].id, {
      client_id: req.params.clientId,
      filename: req.file.originalname,
      category,
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/documents/:clientId/:docId — delete document
router.delete('/:clientId/:docId', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM documents WHERE id=$1 AND client_id=$2 RETURNING *`,
      [req.params.docId, req.params.clientId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Document not found' });

    // Delete physical file
    const filePath = path.join(uploadDir, result.rows[0].filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await auditLog(req.user.id, req.user.username, 'DELETE_DOCUMENT', 'document', parseInt(req.params.docId), {
      filename: result.rows[0].original_name,
    });

    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
