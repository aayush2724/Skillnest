const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route GET /api/users — browse all users with optional skill filter
router.get('/', protect, async (req, res) => {
  try {
    const { skill, search } = req.query;
    let query = { _id: { $ne: req.user._id } };

    if (skill) {
      query.$or = [
        { skillsToTeach: { $regex: skill, $options: 'i' } },
        { skillsToLearn: { $regex: skill, $options: 'i' } }
      ];
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skillsToTeach: { $regex: search, $options: 'i' } },
        { skillsToLearn: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/users/smart-matches — users with complementary skills
router.get('/smart-matches', protect, async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const myTeach = me.skillsToTeach.map(s => s.toLowerCase());
    const myLearn = me.skillsToLearn.map(s => s.toLowerCase());

    // Find users who want what I teach AND teach what I want
    const users = await User.find({ _id: { $ne: me._id } }).select('-password');

    const scored = users.map(user => {
      const theirTeach = user.skillsToTeach.map(s => s.toLowerCase());
      const theirLearn = user.skillsToLearn.map(s => s.toLowerCase());

      // Overlap: they teach what I want to learn
      const theyTeachWhatILearn = theirTeach.filter(s => myLearn.includes(s)).length;
      // Overlap: they want what I teach
      const theyWantWhatITeach = theirLearn.filter(s => myTeach.includes(s)).length;

      const score = theyTeachWhatILearn * 2 + theyWantWhatITeach;
      return { user, score };
    });

    const sorted = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => ({ ...s.user.toObject(), matchScore: s.score }));

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/users/:id — single user profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/profile — update own profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, skillsToTeach, skillsToLearn } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skillsToTeach) user.skillsToTeach = skillsToTeach;
    if (skillsToLearn) user.skillsToLearn = skillsToLearn;

    // Award badge if first skill added
    const hasBadge = user.badges.find(b => b.name === 'First Skill');
    if (!hasBadge && (user.skillsToTeach.length > 0 || user.skillsToLearn.length > 0)) {
      user.badges.push({ name: 'First Skill', icon: '🌱' });
    }
    // Award "Teacher" badge
    const hasTeacherBadge = user.badges.find(b => b.name === 'Teacher');
    if (!hasTeacherBadge && user.skillsToTeach.length >= 3) {
      user.badges.push({ name: 'Teacher', icon: '🎓' });
    }
    // Award "Learner" badge
    const hasLearnerBadge = user.badges.find(b => b.name === 'Eager Learner');
    if (!hasLearnerBadge && user.skillsToLearn.length >= 3) {
      user.badges.push({ name: 'Eager Learner', icon: '📚' });
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      avatarColor: updated.avatarColor,
      skillsToTeach: updated.skillsToTeach,
      skillsToLearn: updated.skillsToLearn,
      badges: updated.badges,
      bio: updated.bio
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
