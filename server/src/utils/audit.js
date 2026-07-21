const { pool } = require('../db');

const auditLog = async (userId, username, action, entityType, entityId, details) => {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, username, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, username, action, entityType, entityId, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { auditLog };
