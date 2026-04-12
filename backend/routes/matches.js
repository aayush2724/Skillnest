const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route POST /api/matches — send a skill exchange proposal
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, message, teachSkill, learnSkill } = req.body;

    if (receiverId === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot match with yourself' });

    // Check if already sent
    const existing = await Match.findOne({
      requester: req.user._id,
      receiver: receiverId,
      status: { $in: ['pending', 'accepted'] }
    });
    if (existing) return res.status(400).json({ message: 'Exchange already exists or is pending' });

    const match = await Match.create({
      requester: req.user._id,
      receiver: receiverId,
      message: message || '',
      teachSkill,
      learnSkill
    });

    const populated = await Match.findById(match._id)
      .populate('requester', 'name email avatarColor skillsToTeach skillsToLearn')
      .populate('receiver', 'name email avatarColor skillsToTeach skillsToLearn');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/matches — get all my matches (sent + received)
router.get('/', protect, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }]
    })
      .populate('requester', 'name email avatarColor skillsToTeach skillsToLearn')
      .populate('receiver', 'name email avatarColor skillsToTeach skillsToLearn')
      .sort({ createdAt: -1 });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/matches/:id — accept or reject
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) return res.status(404).json({ message: 'Match not found' });

    if (match.receiver.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the receiver can update this match' });

    if (!['accepted', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be accepted or rejected' });

    match.status = status;
    await match.save();

    // Award "First Match" badge when accepted
    if (status === 'accepted') {
      const receiver = await User.findById(req.user._id);
      const hasBadge = receiver.badges.find(b => b.name === 'First Match');
      if (!hasBadge) {
        receiver.badges.push({ name: 'First Match', icon: '🤝' });
        await receiver.save();
      }
      const requester = await User.findById(match.requester);
      const reqHasBadge = requester.badges.find(b => b.name === 'First Match');
      if (!reqHasBadge) {
        requester.badges.push({ name: 'First Match', icon: '🤝' });
        await requester.save();
      }
    }

    const populated = await Match.findById(match._id)
      .populate('requester', 'name email avatarColor skillsToTeach skillsToLearn')
      .populate('receiver', 'name email avatarColor skillsToTeach skillsToLearn');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/matches/:id — cancel a pending match (requester only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.requester.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the requester can cancel this match' });
    await match.deleteOne();
    res.json({ message: 'Match cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
