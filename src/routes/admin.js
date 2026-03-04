const express = require('express');
const { authenticate } = require('../middleware/auth');
const { resetCache, getSystemPrompt } = require('../llm/systemPrompt');

const router = express.Router();
router.use(authenticate);

// Hot-reload system prompt without restarting the bot
router.post('/reload-prompt', (req, res) => {
  try {
    resetCache();
    // Trigger rebuild by calling getSystemPrompt once
    const prompt = getSystemPrompt();
    res.json({
      ok: true,
      message: 'System prompt reloaded successfully',
      promptLength: prompt.length
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
