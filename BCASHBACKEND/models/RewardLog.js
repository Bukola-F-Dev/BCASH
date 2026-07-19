const mongoose = require('mongoose');

const RewardLogSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  ipAddress: { type: String, required: true },
  claimedAt: { type: Date, default: Date.now }
});

// Ensure an IP can only claim a reward ONCE per video
RewardLogSchema.index({ videoId: 1, ipAddress: 1 }, { unique: true });

module.exports = mongoose.model('RewardLog', RewardLogSchema);