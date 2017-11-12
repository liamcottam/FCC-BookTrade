const mongoose = require('mongoose');

const { Schema } = mongoose;

const TradeSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderBook: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientBook: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Trade', TradeSchema);
