const express = require('express');
const Case = require('../models/Case');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { status, client_id } = req.query;
    const cases = await Case.findAll({ status, clientId: client_id });
    res.json({ cases });
  } catch (err) {
    console.error('List cases error:', err);
    res.status(500).json({ error: 'Failed to list cases' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const caseRecord = await Case.findById(req.params.id);
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });
    res.json({ case: caseRecord });
  } catch (err) {
    console.error('Get case error:', err);
    res.status(500).json({ error: 'Failed to get case' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { case_number, title, description, case_type, client_id, court, next_hearing } = req.body;
    if (!case_number || !title || !client_id) {
      return res.status(400).json({ error: 'case_number, title, and client_id are required' });
    }
    const caseRecord = await Case.create({
      caseNumber: case_number,
      title,
      description,
      caseType: case_type,
      clientId: client_id,
      userId: req.user.id,
      court,
      nextHearing: next_hearing,
    });
    res.status(201).json({ case: caseRecord });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Case number already exists' });
    }
    console.error('Create case error:', err);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, case_type, court, next_hearing } = req.body;
    const fields = {};
    if (title !== undefined) fields.title = title;
    if (description !== undefined) fields.description = description;
    if (status !== undefined) fields.status = status;
    if (case_type !== undefined) fields.case_type = case_type;
    if (court !== undefined) fields.court = court;
    if (next_hearing !== undefined) fields.next_hearing = next_hearing;

    const caseRecord = await Case.update(req.params.id, fields);
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });
    res.json({ case: caseRecord });
  } catch (err) {
    console.error('Update case error:', err);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Case.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Case not found' });
    res.json({ message: 'Case deleted' });
  } catch (err) {
    console.error('Delete case error:', err);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

module.exports = router;
