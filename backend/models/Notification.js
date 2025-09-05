const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['answer', 'comment', 'mention'], // Types of notifications
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    // This can refer to a Question, Answer, or Comment depending on the notification type
    // We might need to add a 'ref' dynamically or handle it in application logic
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);
