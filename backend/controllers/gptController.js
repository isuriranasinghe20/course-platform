const OpenAI = require('openai');
const { asyncHandler } = require('../middleware/errorMiddleware');
const Course = require('../models/Course');
const counter = require('../utils/gptRequestCounter');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// @desc    Get GPT-based course recommendations
// @route   POST /api/gpt/recommend
// @access  Private/Student
const recommendCourses = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    res.status(400);
    throw new Error('Prompt is required');
  }

  // Guard: enforce max 250 GPT API calls
  if (counter.isLimitReached()) {
    return res.status(429).json({
      message:
        'GPT request limit reached. Recommendations are temporarily unavailable.',
      totalRequestsMade: counter.getCount(),
      maxRequests: counter.getMax(),
    });
  }

  // 1 DB query — NOT a GPT call
  const courses = await Course.find().select(
    'title description category level'
  );

  if (courses.length === 0) {
    return res.json({
      recommendations: [],
      message: 'No courses available yet',
      totalRequestsMade: counter.getCount(),
    });
  }

  // Build a compact catalog to keep tokens low
  const catalog = courses
    .map(
      (c) =>
        `ID:${c._id} | Title:${c.title} | Category:${c.category} | Level:${c.level} | Desc:${(
          c.description || ''
        ).slice(0, 100)}`
    )
    .join('\n');

  const systemPrompt = `You are a course recommendation assistant.
From the catalog below, recommend between 2 and 4 courses that best match the user's goal.
Return ONLY valid JSON in this exact shape:
{
  "recommendations": [
    { "id": "<course id from catalog>", "reason": "<short reason>" }
  ]
}
Use only IDs that appear in the catalog. Do not invent courses.

CATALOG:
${catalog}`;

  try {
    // ONE GPT call — no loops
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    // Count only successful calls
    counter.increment();

    let parsed;
    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch {
      parsed = { recommendations: [] };
    }

    const recs = parsed.recommendations || [];
    const ids = recs.map((r) => r.id).filter(Boolean);

    const matched = await Course.find({ _id: { $in: ids } }).populate(
      'instructor',
      'username'
    );

    // Attach reasons to each course
    const withReasons = matched.map((c) => {
      const match = recs.find(
        (r) => String(r.id) === String(c._id)
      );
      return { ...c.toObject(), reason: match?.reason || '' };
    });

    res.json({
      recommendations: withReasons,
      totalRequestsMade: counter.getCount(),
      maxRequests: counter.getMax(),
    });
  } catch (err) {
  console.error('GPT error:', err.status, err.message);

  // Invalid API key (401)
  if (err.status === 401) {
    return res.status(401).json({
      message: 'GPT service is currently unavailable (invalid API key).',
      hint: 'Please contact the administrator.',
      totalRequestsMade: counter.getCount(),
    });
  }

  // Rate limited or no credits (429)
  if (err.status === 429) {
    return res.status(429).json({
      message: 'GPT quota exceeded or rate limited. Please try again later.',
      totalRequestsMade: counter.getCount(),
    });
  }

  // OpenAI server errors (5xx)
  if (err.status >= 500) {
    return res.status(503).json({
      message: 'GPT service is temporarily unavailable. Please try again.',
      totalRequestsMade: counter.getCount(),
    });
  }

  // Network / timeout / everything else
  return res.status(500).json({
    message: 'GPT recommendation failed.',
    totalRequestsMade: counter.getCount(),
  });
}
});

// @desc    Get GPT request usage stats
// @route   GET /api/gpt/usage
// @access  Private
const getUsage = asyncHandler(async (req, res) => {
  res.json({
    totalRequestsMade: counter.getCount(),
    maxRequests: counter.getMax(),
    remaining: counter.getMax() - counter.getCount(),
  });
});

module.exports = { recommendCourses, getUsage };