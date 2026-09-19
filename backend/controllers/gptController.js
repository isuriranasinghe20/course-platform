const OpenAI = require('openai');
const { asyncHandler } = require('../middleware/errorMiddleware');
const Course = require('../models/Course');
const counter = require('../utils/gptRequestCounter');

// Toggle this to true once a valid OpenAI key is provided
const USE_REAL_GPT = process.env.USE_REAL_GPT === 'true';

const openai = USE_REAL_GPT
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// @desc    Get GPT-based course recommendations
// @route   POST /api/gpt/recommend
// @access  Private/Student
const recommendCourses = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    res.status(400);
    throw new Error('Prompt is required');
  }

  // Enforce max 250 API calls (per assessment rules)
  if (counter.isLimitReached()) {
    return res.status(429).json({
      message: 'GPT request limit reached. Please try again later.',
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

  // ---------- MOCK MODE (no GPT call) ----------
  if (!USE_REAL_GPT) {
    // Simple keyword scoring to make the mock feel "smart"
    const keywords = prompt.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = courses.map((c) => {
      const text = `${c.title} ${c.description} ${c.category} ${c.level}`.toLowerCase();
      const score = keywords.reduce(
        (acc, kw) => acc + (text.includes(kw) ? 1 : 0),
        0
      );
      return { course: c, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(3, scored.length));

    counter.increment(); // count it as a request so the log is meaningful

    return res.json({
      recommendations: top.map(({ course, score }) => ({
        ...course.toObject(),
        reason:
          score > 0
            ? `Matches your interest in: ${keywords.join(', ')}`
            : 'Popular course to start with',
      })),
      totalRequestsMade: counter.getCount(),
      maxRequests: counter.getMax(),
      mode: 'mock',
      note: 'GPT integration is implemented but running in mock mode while the API key is validated.',
    });
  }

  // ---------- REAL GPT CALL ----------
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
Return ONLY valid JSON in this shape:
{ "recommendations": [ { "id": "<course id from catalog>", "reason": "<short reason>" } ] }
Use only IDs from the catalog.

CATALOG:
${catalog}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

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
    const withReasons = matched.map((c) => ({
      ...c.toObject(),
      reason: recs.find((r) => String(r.id) === String(c._id))?.reason || '',
    }));

    res.json({
      recommendations: withReasons,
      totalRequestsMade: counter.getCount(),
      maxRequests: counter.getMax(),
      mode: 'live',
    });
  } catch (err) {
    console.error('GPT error:', err.message);

    if (err.status === 401) {
      return res.status(502).json({
        message:
          'GPT service returned 401 — the API key is invalid. Running in mock mode is recommended.',
        totalRequestsMade: counter.getCount(),
      });
    }
    if (err.status === 429 || err.code === 'insufficient_quota') {
      return res.status(429).json({
        message: 'GPT quota exceeded. Please try again later.',
        totalRequestsMade: counter.getCount(),
      });
    }

    res.status(500);
    throw new Error('GPT recommendation failed');
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
    mode: USE_REAL_GPT ? 'live' : 'mock',
  });
});

module.exports = { recommendCourses, getUsage };