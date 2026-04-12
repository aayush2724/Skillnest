const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: { type: String, default: '', maxlength: 500 },
  // What skills are being exchanged
  teachSkill: { type: String, required: true },  // requester teaches this
  learnSkill: { type: String, required: true },  // requester wants to learn this
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

MatchSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Match', MatchSchema);
