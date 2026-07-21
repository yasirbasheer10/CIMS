const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const XLSX = require('xlsx');

router.use(authMiddleware);

// GET /api/export/clients?format=csv|excel
router.get('/clients', async (req, res) => {
  const { format = 'excel', archived = 'false' } = req.query;
  const isArchived = archived === 'true';

  try {
    const result = await pool.query(
      `SELECT
        full_name as "Full Name",
        father_husband_name as "Father/Husband Name",
        cnic as "CNIC",
        TO_CHAR(dob, 'YYYY-MM-DD') as "Date of Birth",
        gender as "Gender",
        nationality as "Nationality",
        mobile as "Mobile",
        alt_phone as "Alternate Phone",
        email as "Email",
        current_address as "Current Address",
        permanent_address as "Permanent Address",
        city as "City",
        province as "Province",
        occupation as "Occupation",
        employer as "Employer",
        ntn as "NTN",
        strn as "STRN",
        tax_remarks as "Tax Remarks",
        legal_remarks as "Legal Remarks",
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as "Created At",
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI') as "Updated At"
       FROM clients WHERE is_archived = $1 ORDER BY full_name ASC`,
      [isArchived]
    );

    const ws = XLSX.utils.json_to_sheet(result.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');

    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"');
      return res.send(csv);
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="clients.xlsx"');
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
