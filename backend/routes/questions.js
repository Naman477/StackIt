const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Question = require('../models/Question');
const User = require('../models/User');
const Tag = require('../models/Tag');
const { check, validationResult } = require('express-validator');

// @route   POST api/questions
// @desc    Create a question
// @access  Private
router.post(
  '/',
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('tags', 'Tags are required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tags } = req.body;

    try {
      const user = await User.findById(req.user.id).select('-password');

      // Handle tags: find existing or create new ones
      const tagIds = [];
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = new Tag({ name: tagName });
          await tag.save();
        }
        tagIds.push(tag.id);
      }

      const newQuestion = new Question({
        title,
        description,
        tags: tagIds,
        author: req.user.id,
      });

      const question = await newQuestion.save();
      res.json(question);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/questions
// @desc    Get all questions (with optional search query, pagination, sorting, and filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', tags } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (tags) {
      const tagNames = tags.split(',').map(tag => tag.trim());
      const tagObjects = await Tag.find({ name: { $in: tagNames } });
      const tagIds = tagObjects.map(tag => tag._id);
      query.tags = { $in: tagIds };
    }

    const sortOptions = {};
    if (sortBy === 'createdAt' || sortBy === 'answersCount') {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    } else {
      // Default sort if sortBy is invalid
      sortOptions.createdAt = -1;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOptions,
      populate: ['author', 'tags'],
    };

    const questions = await Question.paginate(query, options);
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', ['username'])
      .populate('tags', ['name']);

    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }

    res.json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Question not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/questions/:id
// @desc    Delete a question
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }

    // Check user
    if (question.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await question.deleteOne();

    res.json({ msg: 'Question removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/questions/:id
// @desc    Update a question
// @access  Private
router.put(
  '/:id',
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('tags', 'Tags are required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tags } = req.body;

    // Build question object
    const questionFields = {};
    if (title) questionFields.title = title;
    if (description) questionFields.description = description;

    try {
      let question = await Question.findById(req.params.id);

      if (!question) return res.status(404).json({ msg: 'Question not found' });

      // Check user
      if (question.author.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // Handle tags update
      if (tags && tags.length > 0) {
        const tagIds = [];
        for (const tagName of tags) {
          let tag = await Tag.findOne({ name: tagName });
          if (!tag) {
            tag = new Tag({ name: tagName });
            await tag.save();
          }
          tagIds.push(tag.id);
        }
        questionFields.tags = tagIds;
      }

      question = await Question.findOneAndUpdate(
        { _id: req.params.id },
        { $set: questionFields },
        { new: true }
      );

      res.json(question);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
