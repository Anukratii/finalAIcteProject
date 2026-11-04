/**
 * Prompt builder for IBM Granite
 * Constructs structured, context-rich prompts for each feature
 */

const SYSTEM_PERSONA = `You are FitBuddy, an expert AI fitness and wellness companion powered by IBM Granite. 
You provide safe, personalised, science-backed fitness advice. 
Always be encouraging, clear, and concise. Never recommend anything unsafe or extreme.
Format responses in a clean, readable way using numbered lists, bullet points, or sections where appropriate.`;

/**
 * Build a workout plan prompt
 */
function workoutPrompt(userProfile) {
  const {
    fitnessLevel = 'beginner',
    goal = 'general fitness',
    availableTime = 30,
    equipment = 'none',
    age = 'unknown',
    weight = 'unknown',
    limitations = 'none',
    preferredDays = 5,
    focusArea = 'full body'
  } = userProfile;

  return `${SYSTEM_PERSONA}

Create a detailed ${preferredDays}-day home workout plan for the following person:
- Fitness Level: ${fitnessLevel}
- Primary Goal: ${goal}
- Available Time Per Session: ${availableTime} minutes
- Equipment Available: ${equipment}
- Age: ${age}
- Weight: ${weight}
- Physical Limitations/Injuries: ${limitations}
- Focus Area: ${focusArea}

For each day include:
1. Warm-up (5 minutes)
2. Main workout with sets, reps, and rest times
3. Cool-down (5 minutes)
4. A brief explanation of why this workout suits their goal

Ensure the plan is realistic, progressive, and safe. End with 2-3 motivational tips.`;
}

/**
 * Build a nutrition guidance prompt
 */
function nutritionPrompt(userProfile) {
  const {
    goal = 'general health',
    dietaryRestrictions = 'none',
    allergies = 'none',
    mealsPerDay = 3,
    budget = 'moderate',
    weight = 'unknown',
    activityLevel = 'moderate'
  } = userProfile;

  return `${SYSTEM_PERSONA}

Provide a balanced daily meal plan and nutrition guidance for:
- Fitness/Health Goal: ${goal}
- Dietary Restrictions: ${dietaryRestrictions}
- Food Allergies: ${allergies}
- Preferred Meals Per Day: ${mealsPerDay}
- Budget Level: ${budget}
- Current Weight: ${weight}
- Activity Level: ${activityLevel}

Include:
1. Estimated daily calorie target and macros (protein, carbs, fat)
2. A sample full-day meal plan (breakfast, lunch, dinner, snacks)
3. 5 healthy food swap suggestions
4. Hydration recommendations
5. Foods to prioritise and foods to limit

Keep suggestions practical, affordable, and culturally flexible.`;
}

/**
 * Build a motivational message prompt
 */
function motivationPrompt(context) {
  const {
    streak = 0,
    goal = 'fitness',
    mood = 'neutral',
    lastWorkout = 'unknown'
  } = context;

  return `${SYSTEM_PERSONA}

Generate an energising, personalised motivational message for a fitness app user:
- Current streak: ${streak} days
- Fitness goal: ${goal}
- Current mood: ${mood}
- Last workout: ${lastWorkout}

The message should:
1. Acknowledge their current state
2. Celebrate any progress (even small)
3. Inspire them to take their next step
4. Include one concrete action they can do right now
5. End with a powerful, memorable quote

Keep it under 150 words. Be warm, genuine, and energetic — not cliche.`;
}

/**
 * Build a general fitness Q&A prompt
 */
function fitnessQAPrompt(question, conversationHistory = []) {
  const historyContext = conversationHistory.length > 0
    ? `\nPrevious conversation:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n`
    : '';

  return `${SYSTEM_PERSONA}
${historyContext}
User question: ${question}

Answer in a helpful, accurate, and encouraging way. 
If the question is about exercise technique, include safety tips.
If you're unsure, recommend consulting a certified professional.`;
}

/**
 * Build a workout explanation prompt
 */
function workoutExplanationPrompt(exercise, userGoal) {
  return `${SYSTEM_PERSONA}

Explain why the exercise "${exercise}" is beneficial for someone with the goal: "${userGoal}"

Include:
1. Which muscles it targets
2. How it helps achieve the stated goal
3. Proper form tips (3-4 key points)
4. Common mistakes to avoid
5. Beginner modification and advanced variation

Keep the response clear, practical, and under 250 words.`;
}

/**
 * Build a daily habit/wellness tip prompt
 */
function wellnessTipPrompt(area) {
  const validAreas = ['hydration', 'sleep', 'recovery', 'stress', 'posture', 'general'];
  const topic = validAreas.includes(area) ? area : 'general';

  return `${SYSTEM_PERSONA}

Share a practical, science-backed wellness tip focused on: ${topic}

Include:
1. Why this matters for fitness and health
2. 3 specific, actionable steps to implement today
3. One common myth or mistake to avoid
4. A measurable way to track improvement

Keep it concise, practical, and motivating.`;
}

module.exports = {
  workoutPrompt,
  nutritionPrompt,
  motivationPrompt,
  fitnessQAPrompt,
  workoutExplanationPrompt,
  wellnessTipPrompt,
  SYSTEM_PERSONA
};
