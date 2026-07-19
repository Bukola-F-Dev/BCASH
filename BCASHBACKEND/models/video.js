const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  youtubeUrl: { type: String, required: true }, // e.g., https://www.youtube.com/watch?v=XXXXXX
  rewardAmount: { type: Number, default: 0.50 } // Cash token amount
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);