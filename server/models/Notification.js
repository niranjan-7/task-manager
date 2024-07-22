const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  users:{
    type:[String],
  },
  updates: [{
    field: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed }
  }]
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
