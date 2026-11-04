const express = require('express');
const router = express.Router();
const { generateText } = require('../services/graniteClient');
const { motivationPrompt, wellnessTipPrompt } = require('../services/promptBuilder');

/**
 * POST /api/motivation/message
 * Generate a personalised motivational message
 */
router.post('/message', async (req, res) => {
  try {
    const context = req.body;
    const prompt = motivationPrompt(context);

    const message = await generateText(prompt, {
      max_new_tokens: 250,
      temperature: 0.8
    });

    res.json({ success: true, message, context });
  } catch (err) {
    console.error('[Motivation] Message error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/motivation/tip/:area
 * Get a wellness tip for a specific area
 */
router.get('/tip/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const prompt = wellnessTipPrompt(area);

    const tip = await generateText(prompt, {
      max_new_tokens: 400,
      temperature: 0.7
    });

    res.json({ success: true, area, tip });
  } catch (err) {
    console.error('[Motivation] Tip error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/motivation/daily
 * Get a daily fitness inspiration
 */
router.get('/daily', async (req, res) => {
  try {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    const prompt = `You are FitBuddy, an expert AI fitness companion.

It is ${today}. Provide a short, energetic daily fitness inspiration message for a fitness app user.

Include:
1. A powerful opening statement specific to ${today}
2. One quick fitness or wellness action they can do today (under 10 minutes)
3. One powerful quote from a real athlete or health expert
4. A brief reminder about hydration or rest

Keep it under 120 words. Make it feel personal and motivating.`;

    const inspiration = await generateText(prompt, {
      max_new_tokens: 250,
      temperature: 0.85
    });

    res.json({ success: true, day: today, inspiration });
  } catch (err) {
    console.error('[Motivation] Daily error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
