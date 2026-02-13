const pool = require('./pool');
const bcrypt = require('bcrypt');

const ADMIN_EMAIL = 'admin@gurulegal.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Administrador';

async function seed() {
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
    if (existing.rows.length > 0) {
      console.log(`Admin user already exists (${ADMIN_EMAIL})`);
    } else {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await pool.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        [ADMIN_EMAIL, hash, ADMIN_NAME, 'admin']
      );
      console.log('Admin user created successfully');
    }

    console.log('\n--- Login Credentials ---');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('-------------------------\n');
    console.log('⚠️  Change this password after first login!');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
