const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getCourses)
  .post(protect, authorize('instructor'), createCourse);

// IMPORTANT: keep this BEFORE '/:id' so it isn't captured by the id route
router.get('/instructor/mine', protect, authorize('instructor'), getMyCourses);

router
  .route('/:id')
  .get(protect, getCourseById)
  .put(protect, authorize('instructor'), updateCourse)
  .delete(protect, authorize('instructor'), deleteCourse);

module.exports = router;