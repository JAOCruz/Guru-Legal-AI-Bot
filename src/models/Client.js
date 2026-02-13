const pool = require('../db/pool');

const Client = {
  async create({ name, phone, email, address, notes, userId }) {
    const { rows } = await pool.query(
      `INSERT INTO clients (name, phone, email, address, notes, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, phone, email || null, address || null, notes || null, userId]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findByPhone(phone) {
    const { rows } = await pool.query('SELECT * FROM clients WHERE phone = $1', [phone]);
    return rows[0] || null;
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE clients SET ${sets}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async getDefaultUserId() {
    const { rows } = await pool.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
    return rows[0]?.id || null;
  },
};

module.exports = Client;
