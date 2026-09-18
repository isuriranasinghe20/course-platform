const { asyncHandler } = require('../middleware/errorMiddleware');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    res.status(400);
    throw new Error('Please provide username, password, and role');
  }
  if (!['student', 'instructor'].includes(role)) {
    res.status(400);
    throw new Error('Role must be either student or instructor');
  }

  const existing = await User.findOne({ username });
  if (existing) {
    res.status(400);
    throw new Error('Username already taken');
  }

  const user = await User.create({ username, password, role });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide username and password');
  }

  const user = await User.findOne({ username }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    _id: user._id,
    username: user.username,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getMe };