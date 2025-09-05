const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  answersCount: {
    type: Number,
    default: 0,
  },
});

QuestionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Question', QuestionSchema);