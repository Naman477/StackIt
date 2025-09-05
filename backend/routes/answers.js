const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Import User model
const { check, validationResult } = require('express-validator');

// @route   POST api/answers/:question_id
// @desc    Add an answer to a question
// @access  Private
router.post(
  '/:question_id',
  auth,
  [
    check('content', 'Answer content is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const question = await Question.findById(req.params.question_id);
      if (!question) {
        return res.status(404).json({ msg: 'Question not found' });
      }

      const newAnswer = new Answer({
        content: req.body.content,
        author: req.user.id,
        question: req.params.question_id,
      });

      const answer = await newAnswer.save();

      // Increment answersCount in the Question model
      question.answersCount = (question.answersCount || 0) + 1;
      await question.save();

      // Create notification if the answer is not from the question owner
      if (question.author.toString() !== req.user.id) {
        const notification = new Notification({
          recipient: question.author,
          type: 'answer',
          message: `Someone answered your question: "${question.title.substring(0, 50)}..."`,
          relatedEntity: question._id,
        });
        await notification.save();

        // Emit real-time notification
        const io = req.app.get('socketio');
        io.to(question.author.toString()).emit('newNotification', notification);
      }

      res.json(answer);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/answers/:question_id
// @desc    Get all answers for a question
// @access  Public
router.get('/:question_id', async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.question_id })
      .populate('author', ['username'])
      .sort({ createdAt: 1 });
    res.json(answers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/answers/:id
// @desc    Delete an answer
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ msg: 'Answer not found' });
    }

    // Check user
    if (answer.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await answer.deleteOne();

    // Decrement answersCount in the Question model
    const question = await Question.findById(answer.question);
    if (question) {
      question.answersCount = Math.max(0, (question.answersCount || 0) - 1);
      await question.save();
    }

    res.json({ msg: 'Answer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/answers/accept/:id
// @desc    Mark an answer as accepted
// @access  Private (only question owner)
router.put('/accept/:id', auth, async (req, res) => {
  try {
    let answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ msg: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }

    // Check if the user is the question owner
    if (question.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to accept this answer' });
    }

    // Unaccept any previously accepted answer for this question
    await Answer.updateMany(
      { question: answer.question, isAccepted: true },
      { $set: { isAccepted: false } }
    );

    answer.isAccepted = !answer.isAccepted; // Toggle accepted status
    await answer.save();

    // Update reputation for answer author
    if (answer.isAccepted) { // If it's now accepted
      await User.findByIdAndUpdate(answer.author, { $inc: { reputation: 15 } });
    } else { // If it was unaccepted
      await User.findByIdAndUpdate(answer.author, { $inc: { reputation: -15 } });
    }

    res.json(answer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/answers/vote/:id/:type
// @desc    Upvote or downvote an answer
// @access  Private
router.put('/vote/:id/:type', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ msg: 'Answer not found' });
    }

    const userId = req.user.id;
    const voteType = req.params.type; // 'up' or 'down'

    // Prevent self-voting
    if (answer.author.toString() === userId) {
      return res.status(400).json({ msg: 'Cannot vote on your own answer' });
    }

    // Simplified voting logic: assumes a user can only vote once per answer
    // In a real app, you'd track who voted for what to prevent multiple votes/change votes.
    let reputationChange = 0;
    if (voteType === 'up') {
      answer.upvotes += 1;
      reputationChange = 10;
    } else if (voteType === 'down') {
      answer.downvotes += 1;
      reputationChange = -2;
    } else {
      return res.status(400).json({ msg: 'Invalid vote type' });
    }

    await answer.save();

    // Update reputation for answer author
    await User.findByIdAndUpdate(answer.author, { $inc: { reputation: reputationChange } });

    res.json(answer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;