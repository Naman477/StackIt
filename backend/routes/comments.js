const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');

// @route   POST api/comments/question/:question_id
// @desc    Add a comment to a question
// @access  Private
router.post('/question/:question_id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.question_id);
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }

    const newComment = new Comment({
      content: req.body.content,
      author: req.user.id,
      question: req.params.question_id,
    });

    const comment = await newComment.save();

    // Create notification for question owner
    if (question.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: question.author,
        type: 'comment',
        message: `Someone commented on your question: "${question.title.substring(0, 50)}..."`,
        relatedEntity: question._id,
      });
      await notification.save();

      // Emit real-time notification
      const io = req.app.get('socketio');
      io.to(question.author.toString()).emit('newNotification', notification);
    }

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/comments/question/:question_id
// @desc    Get all comments for a question
// @access  Public
router.get('/question/:question_id', async (req, res) => {
  try {
    const comments = await Comment.find({ question: req.params.question_id })
      .populate('author', ['username'])
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/comments/answer/:answer_id
// @desc    Add a comment to an answer
// @access  Private
router.post('/answer/:answer_id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answer_id);
    if (!answer) {
      return res.status(404).json({ msg: 'Answer not found' });
    }

    const newComment = new Comment({
      content: req.body.content,
      author: req.user.id,
      answer: req.params.answer_id,
    });

    const comment = await newComment.save();

    // Create notification for answer owner
    if (answer.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: answer.author,
        type: 'comment',
        message: `Someone commented on your answer.`,
        relatedEntity: answer._id,
      });
      await notification.save();

      // Emit real-time notification
      const io = req.app.get('socketio');
      io.to(answer.author.toString()).emit('newNotification', notification);
    }

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/comments/answer/:answer_id
// @desc    Get all comments for an answer
// @access  Public
router.get('/answer/:answer_id', async (req, res) => {
  try {
    const comments = await Comment.find({ answer: req.params.answer_id })
      .populate('author', ['username'])
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check user
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await comment.deleteOne();

    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;