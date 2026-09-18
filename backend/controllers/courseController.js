const { asyncHandler } = require('../middleware/errorMiddleware');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate('instructor', 'username role')
    .sort({ createdAt: -1 });
  res.json(courses);
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    'instructor',
    'username role'
  );
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json(course);
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, content, category, level } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Title and description are required');
  }

  const course = await Course.create({
    title,
    description,
    content,
    category,
    level,
    instructor: req.user._id,
  });

  res.status(201).json(course);
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor (owner only)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this course');
  }

  const { title, description, content, category, level } = req.body;
  course.title = title ?? course.title;
  course.description = description ?? course.description;
  course.content = content ?? course.content;
  course.category = category ?? course.category;
  course.level = level ?? course.level;

  const updated = await course.save();
  res.json(updated);
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor (owner only)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }

  // Cleanup enrollments
  await Enrollment.deleteMany({ course: course._id });
  await course.deleteOne();

  res.json({ message: 'Course removed' });
});

// @desc    Get instructor's own courses
// @route   GET /api/courses/instructor/mine
// @access  Private/Instructor
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(courses);
});

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
};