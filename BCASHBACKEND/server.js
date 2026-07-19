const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Video = require('./models/Video');
const RewardLog = require('./models/RewardLog');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:2017/watchToEarn')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// 1. Get all videos (For Homepage)
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin Route: Upload a video
app.post('/api/admin/upload', async (req, res) => {
  const { title, description, youtubeUrl, rewardAmount } = req.body;
  try {
    const newVideo = new Video({ title, description, youtubeUrl, rewardAmount });
    await newVideo.save();
    res.status(201).json({ message: 'Video uploaded successfully!', video: newVideo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Claim Reward Route (With IP checking)
app.post('/api/rewards/claim', async (req, res) => {
  const { videoId, hasLiked, hasShared, fullyWatched } = req.body;
  
  // Get user's IP address (handling proxies if hosted on platforms like Heroku/Render)
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!hasLiked || !hasShared || !fullyWatched) {
    return res.status(400).json({ error: 'You must completely watch, like, and share the video to qualify.' });
  }

  try {
    // Check if this IP has already claimed for this video
    const existingClaim = await RewardLog.findOne({ videoId, ipAddress: userIp });
    if (existingClaim) {
      return res.status(403).json({ error: 'This IP address has already claimed a reward for this video.' });
    }

    // Process reward (In a real app, credit their wallet here)
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found.' });

    // Log the claim
    const newClaim = new RewardLog({ videoId, ipAddress: userIp });
    await newClaim.save();

    res.json({ 
      success: true, 
      message: `Success! Token of $${video.rewardAmount} credited to your account.` 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(403).json({ error: 'This IP address has already claimed a reward for this video.' });
    }
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));