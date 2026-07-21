const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
        is_active BOOLEAN NOT NULL DEFAULT true,
        fbr_password VARCHAR(255),
        profile_image VARCHAR(500),
        phone VARCHAR(20),
        designation VARCHAR(100),
        bio TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    // Safe migrations for existing databases
    const userCols = ['fbr_password VARCHAR(255)', 'profile_image VARCHAR(500)', 'phone VARCHAR(20)', 'designation VARCHAR(100)', 'bio TEXT'];
    for (const col of userCols) {
      const colName = col.split(' ')[0];
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col}`).catch(() => {});
    }


    // Clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        father_husband_name VARCHAR(100),
        cnic VARCHAR(15) UNIQUE,
        dob DATE,
        gender VARCHAR(10),
        nationality VARCHAR(50) DEFAULT 'Pakistani',
        mobile VARCHAR(20),
        alt_phone VARCHAR(20),
        email VARCHAR(100),
        current_address TEXT,
        permanent_address TEXT,
        city VARCHAR(50),
        province VARCHAR(50),
        occupation VARCHAR(100),
        employer VARCHAR(100),
        ntn VARCHAR(20),
        strn VARCHAR(20),
        tax_remarks TEXT,
        legal_remarks TEXT,
        internal_comments TEXT,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100),
        size INTEGER,
        category VARCHAR(50) DEFAULT 'other',
        uploaded_by INTEGER REFERENCES users(id),
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Audit log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        username VARCHAR(50),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        details JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for fast search
    await client.query(`CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients USING gin(to_tsvector('english', full_name))`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_clients_cnic ON clients(cnic)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_clients_mobile ON clients(mobile)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_clients_city ON clients(city)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_clients_ntn ON clients(ntn)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_clients_archived ON clients(is_archived)`);

    // Seed default admin if not exists
    const bcrypt = require('bcryptjs');
    const existingAdmin = await client.query(`SELECT id FROM users WHERE username = 'admin'`);
    if (existingAdmin.rows.length === 0) {
      const hash = await bcrypt.hash('Admin@123', 12);
      await client.query(
        `INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4)`,
        ['admin', hash, 'System Administrator', 'admin']
      );
      console.log('✅ Default admin created: admin / Admin@123');
    }

    await client.query('COMMIT');
    console.log('✅ Database initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
