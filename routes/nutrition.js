const express = require('express');
const router = express.Router();
const { generateText } = require('../services/graniteClient');
const { nutritionPrompt } = require('../services/promptBuilder');

/**
 * POST /api/nutrition/plan
 * Generate a personalised daily meal plan
 */
router.post('/plan', async (req, res) => {
  try {
    const userProfile = req.body;

    if (!userProfile || Object.keys(userProfile).length === 0) {
      return res.status(400).json({ error: 'User profile data is required.' });
    }

    const prompt = nutritionPrompt(userProfile);
    const mealPlan = await generateText(prompt, {
      max_new_tokens: 1000,
      temperature: 0.65
    });

    res.json({
      success: true,
      mealPlan,
      profile: userProfile,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Nutrition] Plan error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/nutrition/analyze
 * Analyze a food item or meal description
 */
router.post('/analyze', async (req, res) => {
  try {
    const { food, goal } = req.body;

    if (!food) {
      return res.status(400).json({ error: 'food is required.' });
    }

    const prompt = `You are FitBuddy, an expert AI nutrition companion.

Analyze the following food/meal: "${food}"
User fitness goal: ${goal || 'general health'}

Provide:
1. Estimated calories and macronutrients (protein, carbs, fat, fiber)
2. Key vitamins and minerals present
3. How this food supports or hinders the stated goal
4. A healthier alternative if applicable
5. Best time to eat this food for optimal fitness results

Be concise and practical.`;

    const analysis = await generateText(prompt, {
      max_new_tokens: 600,
      temperature: 0.5
    });

    res.json({ success: true, food, analysis });
  } catch (err) {
    console.error('[Nutrition] Analyze error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/nutrition/swap
 * Suggest healthy food swaps
 */
router.post('/swap', async (req, res) => {
  try {
    const { foodItem, goal, restriction } = req.body;

    if (!foodItem) {
      return res.status(400).json({ error: 'foodItem is required.' });
    }

    const prompt = `You are FitBuddy, an expert AI nutrition companion.

Suggest 5 healthy alternatives to: "${foodItem}"
User goal: ${goal || 'general health'}
Dietary restriction: ${restriction || 'none'}

For each alternative:
- Name the food
- Why it is a better choice
- How to prepare/use it simply
- Approximate calorie comparison

Keep it practical and encouraging.`;

    const swaps = await generateText(prompt, {
      max_new_tokens: 600,
      temperature: 0.6
    });

    res.json({ success: true, foodItem, swaps });
  } catch (err) {
    console.error('[Nutrition] Swap error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
