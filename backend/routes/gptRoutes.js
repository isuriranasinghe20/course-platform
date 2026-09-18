const express = require('express');
const router = express.Router();
const {
  recommendCourses,
  getUsage,
} = require('../controllers/gptController');
const { protect, authorize } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Per-user protection so one student can't burn your 250 requests
const gptLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // 5 requests per minute per IP
  message: { message: 'Too many recommendation requests. Slow down.' },
});

router.post(
  '/recommend',
  protect,
  authorize('student'),
  gptLimiter,
  recommendCourses
);

router.get('/usage', protect, getUsage);

module.exports = router;