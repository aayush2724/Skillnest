const express = require('express');
const router = express.Router();
const ProgressLog = require('../models/ProgressLog');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route POST /api/logs — create a progress log
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, skill, hoursSpent, mood, matchId } = req.body;

    if (!title || !content || !skill)
      return res.status(400).json({ message: 'Title, content, and skill are required' });

    const log = await ProgressLog.create({
      user: req.user._id,
      match: matchId || null,
      title,
      content,
      skill,
      hoursSpent: hoursSpent || 1,
      mood: mood || 'good'
    });

    // Award "Journaler" badge after 3 logs
    const logCount = await ProgressLog.countDocuments({ user: req.user._id });
    const user = await User.findById(req.user._id);
    const hasBadge = user.badges.find(b => b.name === 'Journaler');
    if (!hasBadge && logCount >= 3) {
      user.badges.push({ name: 'Journaler', icon: '✍️' });
      await user.save();
    }
    // Award "Dedicated" badge after 10 logs
    const hasDedicatedBadge = user.badges.find(b => b.name === 'Dedicated');
    if (!hasDedicatedBadge && logCount >= 10) {
      user.badges.push({ name: 'Dedicated', icon: '🔥' });
      await user.save();
    }

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/logs — get my logs
router.get('/', protect, async (req, res) => {
  try {
    const logs = await ProgressLog.find({ user: req.user._id })
      .populate('match', 'teachSkill learnSkill')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/logs/stats — get learning stats
router.get('/stats', protect, async (req, res) => {
  try {
    const logs = await ProgressLog.find({ user: req.user._id });
    const totalHours = logs.reduce((sum, l) => sum + l.hoursSpent, 0);
    const skillBreakdown = {};
    logs.forEach(l => {
      skillBreakdown[l.skill] = (skillBreakdown[l.skill] || 0) + l.hoursSpent;
    });
    const moodBreakdown = { great: 0, good: 0, okay: 0, tough: 0 };
    logs.forEach(l => { moodBreakdown[l.mood]++; });
    res.json({ totalLogs: logs.length, totalHours, skillBreakdown, moodBreakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/logs/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const log = await ProgressLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    if (log.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await log.deleteOne();
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
