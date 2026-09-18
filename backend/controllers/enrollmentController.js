const { asyncHandler } = require('../middleware/errorMiddleware');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private/Student
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  });
  if (existing) {
    res.status(400);
    throw new Error('You are already enrolled in this course');
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
    status: 'enrolled',
  });

  const populated = await enrollment.populate('course', 'title description');

  res.status(201).json({
    message: `Successfully enrolled in "${course.title}"`,
    enrollment: populated,
  });
});

// @desc    Get current student's enrollments
// @route   GET /api/enrollments/my
// @access  Private/Student
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'username' },
    })
    .sort({ enrolledAt: -1 });
  res.json(enrollments);
});

// @desc    Get students enrolled in a course (instructor view)
// @route   GET /api/enrollments/course/:courseId
// @access  Private/Instructor (owner)
const getCourseEnrollments = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this course enrollments');
  }

  const enrollments = await Enrollment.find({ course: course._id })
    .populate('student', 'username role')
    .sort({ enrolledAt: -1 });

  res.json(enrollments);
});

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollments,
};