const express = require('express');
const router = express.Router();
const { chat } = require('../services/graniteClient');
const { fitnessQAPrompt, SYSTEM_PERSONA } = require('../services/promptBuilder');

// In-memory conversation store (use Redis or DB for production)
const conversations = new Map();

/**
 * POST /api/chat/message
 * Main conversational endpoint — supports multi-turn chat
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, userProfile } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required.' });
    }

    const sid = sessionId || `session_${Date.now()}`;

    // Retrieve or initialise conversation history
    if (!conversations.has(sid)) {
      conversations.set(sid, [
        {
          role: 'system',
          content: `${SYSTEM_PERSONA}${userProfile ? `\n\nUser profile: ${JSON.stringify(userProfile)}` : ''}`
        }
      ]);
    }

    const history = conversations.get(sid);
    history.push({ role: 'user', content: message });

    // Keep last 20 messages to stay within token limits
    const trimmedHistory = history.length > 21
      ? [history[0], ...history.slice(-(20))]
      : history;

    let reply;
    try {
      reply = await chat(trimmedHistory, { max_new_tokens: 700, temperature: 0.7 });
    } catch (chatErr) {
      // Fallback to generate if chat API not available for model
      const prompt = fitnessQAPrompt(message, history.slice(1));
      reply = await require('../services/graniteClient').generateText(prompt, {
        max_new_tokens: 700,
        temperature: 0.7
      });
    }

    history.push({ role: 'assistant', content: reply });

    res.json({
      success: true,
      sessionId: sid,
      reply,
      messageCount: history.length - 1
    });
  } catch (err) {
    console.error('[Chat] Message error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/chat/session/:sessionId
 * Clear a conversation session
 */
router.delete('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const deleted = conversations.delete(sessionId);
  res.json({ success: deleted, message: deleted ? 'Session cleared.' : 'Session not found.' });
});

/**
 * GET /api/chat/session/:sessionId
 * Get conversation history
 */
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = conversations.get(sessionId);
  if (!history) return res.status(404).json({ error: 'Session not found.' });

  // Return without system message
  res.json({ success: true, sessionId, history: history.slice(1) });
});

module.exports = router;
