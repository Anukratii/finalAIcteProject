const express = require('express');
const router = express.Router();
const { generateText } = require('../services/graniteClient');
const { workoutPrompt, workoutExplanationPrompt } = require('../services/promptBuilder');

/**
 * POST /api/fitness/workout
 * Generate a personalised workout plan
 */
router.post('/workout', async (req, res) => {
  try {
    const userProfile = req.body;

    if (!userProfile || Object.keys(userProfile).length === 0) {
      return res.status(400).json({ error: 'User profile data is required.' });
    }

    const prompt = workoutPrompt(userProfile);
    const workoutPlan = await generateText(prompt, {
      max_new_tokens: 1200,
      temperature: 0.6
    });

    res.json({
      success: true,
      workoutPlan,
      profile: userProfile,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Fitness] Workout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/fitness/explain
 * Explain why a specific exercise suits a user's goal
 */
router.post('/explain', async (req, res) => {
  try {
    const { exercise, goal } = req.body;

    if (!exercise || !goal) {
      return res.status(400).json({ error: 'exercise and goal are required.' });
    }

    const prompt = workoutExplanationPrompt(exercise, goal);
    const explanation = await generateText(prompt, {
      max_new_tokens: 500,
      temperature: 0.5
    });

    res.json({ success: true, exercise, goal, explanation });
  } catch (err) {
    console.error('[Fitness] Explain error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/fitness/adapt
 * Adapt an existing workout based on user feedback
 */
router.post('/adapt', async (req, res) => {
  try {
    const { originalPlan, feedback, newConstraints } = req.body;

    if (!originalPlan || !feedback) {
      return res.status(400).json({ error: 'originalPlan and feedback are required.' });
    }

    const prompt = `You are FitBuddy, an expert AI fitness companion.

The user has the following original workout plan:
${originalPlan}

User feedback: "${feedback}"
New constraints or changes: ${newConstraints || 'none'}

Please adapt the workout plan based on this feedback. 
- Keep what is working
- Modify or replace exercises that are too hard, too easy, or not suitable
- Incorporate any new constraints
- Explain each key change you made

Provide the full updated plan.`;

    const adaptedPlan = await generateText(prompt, {
      max_new_tokens: 1200,
      temperature: 0.65
    });

    res.json({ success: true, adaptedPlan, feedback });
  } catch (err) {
    console.error('[Fitness] Adapt error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
