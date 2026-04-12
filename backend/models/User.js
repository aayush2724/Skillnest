const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AVATAR_COLORS = [
  '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6', '#F97316'
];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  bio: { type: String, default: '', maxlength: 300 },
  avatarColor: {
    type: String,
    default: () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  },
  skillsToTeach: [{ type: String, trim: true }],
  skillsToLearn: [{ type: String, trim: true }],
  badges: [
    {
      name: { type: String },
      icon: { type: String },
      earnedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
