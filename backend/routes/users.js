const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id/questions
// @desc    Get all questions by a specific user
// @access  Public
router.get('/:id/questions', async (req, res) => {
  try {
    const questions = await Question.find({ author: req.params.id })
      .populate('author', ['username'])
      .populate('tags', ['name'])
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id/answers
// @desc    Get all answers by a specific user
// @access  Public
router.get('/:id/answers', async (req, res) => {
  try {
    const answers = await Answer.find({ author: req.params.id })
      .populate('author', ['username'])
      .populate('question', ['title'])
      .sort({ createdAt: -1 });
    res.json(answers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
