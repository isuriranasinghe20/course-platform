const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollments,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:courseId', protect, authorize('student'), enrollInCourse);
router.get('/my', protect, authorize('student'), getMyEnrollments);
router.get(
  '/course/:courseId',
  protect,
  authorize('instructor'),
  getCourseEnrollments
);

module.exports = router;