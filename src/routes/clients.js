const express = require('express');
const Client = require('../models/Client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json({ clients });
  } catch (err) {
    console.error('List clients error:', err);
    res.status(500).json({ error: 'Failed to list clients' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ client });
  } catch (err) {
    console.error('Get client error:', err);
    res.status(500).json({ error: 'Failed to get client' });
  }
});

router.get('/:id/summary', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const pool = require('../db/pool');
    const [cases, docsCount, msgs, appointments, docsDetail, mediaRows] = await Promise.all([
      pool.query('SELECT id, case_number, title, status, case_type, created_at FROM cases WHERE client_id = $1 ORDER BY created_at DESC', [client.id]),
      pool.query('SELECT COUNT(*) FROM document_requests WHERE client_id = $1', [client.id]),
      pool.query('SELECT COUNT(*) FROM messages WHERE client_id = $1', [client.id]),
      pool.query("SELECT id, date, time, type, status FROM appointments WHERE client_id = $1 AND date >= CURRENT_DATE ORDER BY date, time", [client.id]),
      // Documents with status and pdf_url for inline review
      pool.query('SELECT id, doc_type, description, status, pdf_url, created_at FROM document_requests WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10', [client.id]),
      // Chat media attachments via client_media table
      pool.query(`SELECT media_type as type, original_name as name, file_path, mime_type, created_at
                  FROM client_media
                  WHERE client_id = $1
                  ORDER BY created_at DESC LIMIT 20`, [client.id]),
    ]);

    // Extract structured data from conversation session (cedula, vehicle info, etc.)
    let extractedData = {};
    try {
      const sessionRow = await pool.query(
        `SELECT session_data FROM sessions WHERE client_id = $1 ORDER BY updated_at DESC LIMIT 1`,
        [client.id]
      );
      if (sessionRow.rows[0]?.session_data) {
        const sd = typeof sessionRow.rows[0].session_data === 'string'
          ? JSON.parse(sessionRow.rows[0].session_data)
          : sessionRow.rows[0].session_data;
        // Pull useful identified fields
        const fields = ['cedula','cedula_vendedor','cedula_comprador','placa','chasis','marca','modelo','color','nombre_vendedor','nombre_comprador','precio'];
        fields.forEach(f => { if (sd[f]) extractedData[f] = sd[f]; });
        // Also check nested vehicle/person data
        if (sd.vehicleData) Object.assign(extractedData, sd.vehicleData);
        if (sd.collectedData) Object.assign(extractedData, sd.collectedData);
      }
    } catch (_) { /* session data is optional */ }

    res.json({
      client,
      cases: cases.rows,
      documentCount: parseInt(docsCount.rows[0].count),
      messageCount: parseInt(msgs.rows[0].count),
      upcomingAppointments: appointments.rows,
      documents: docsDetail.rows,
      chatMedia: mediaRows.rows.map(r => ({ type: r.type, name: r.name, mimeType: r.mime_type, created_at: r.created_at })),
      extractedData,
    });
  } catch (err) {
    console.error('Client summary error:', err);
    res.status(500).json({ error: 'Failed to get client summary' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'name and phone are required' });
    }
    const client = await Client.create({ name, phone, email, address, notes, userId: req.user.id });
    res.status(201).json({ client });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Phone number already exists' });
    }
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    const fields = {};
    if (name !== undefined) fields.name = name;
    if (phone !== undefined) fields.phone = phone;
    if (email !== undefined) fields.email = email;
    if (address !== undefined) fields.address = address;
    if (notes !== undefined) fields.notes = notes;

    // Claim orphaned bot-created clients
    const existing = await Client.findById(req.params.id);
    if (existing && !existing.user_id) {
      fields.user_id = req.user.id;
    }

    const client = await Client.update(req.params.id, fields);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    // Sync name into case titles (format: "CaseType — ClientName")
    if (name && existing && existing.name !== name) {
      const pool = require('../db/pool');
      await pool.query(
        `UPDATE cases SET title = regexp_replace(title, ' — .*$', ' — ' || $1) WHERE client_id = $2 AND title LIKE '%—%'`,
        [name, req.params.id]
      ).catch(err => console.error('Sync case titles error:', err));
    }

    res.json({ client });
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Client.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

module.exports = router;
