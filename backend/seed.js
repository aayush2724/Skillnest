const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Match = require('./models/Match');
const ProgressLog = require('./models/ProgressLog');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing
    await User.deleteMany({});
    await Match.deleteMany({});
    await ProgressLog.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Alice Developer',
        email: 'alice@example.com',
        password,
        bio: 'Full-stack dev by day, aspiring guitarist by night. 🎸',
        skillsToTeach: ['React', 'Node.js', 'JavaScript'],
        skillsToLearn: ['Acoustic Guitar', 'Spanish'],
        avatarColor: '#7C3AED',
        badges: [{ name: 'First Skill', icon: '🌱' }]
      },
      {
        name: 'Carlos Musician',
        email: 'carlos@example.com',
        password,
        bio: 'Professional guitarist and music theorist. Wanting to build my own portfolio website.',
        skillsToTeach: ['Acoustic Guitar', 'Music Theory', 'Piano'],
        skillsToLearn: ['React', 'CSS'],
        avatarColor: '#06B6D4',
        badges: [{ name: 'First Skill', icon: '🌱' }]
      },
      {
        name: 'Sarah Chef',
        email: 'sarah@example.com',
        password,
        bio: 'Pastry chef who loves healthy living. Looking to learn photography for my food blog.',
        skillsToTeach: ['Baking', 'Healthy Cooking', 'Meal Prep'],
        skillsToLearn: ['Photography', 'Yoga'],
        avatarColor: '#10B981'
      },
      {
        name: 'David Photographer',
        email: 'david@example.com',
        password,
        bio: 'Travel photographer. I want to learn how to cook something other than toast.',
        skillsToTeach: ['Photography', 'Lightroom', 'Editing'],
        skillsToLearn: ['Baking', 'Japanese'],
        avatarColor: '#F59E0B'
      },
      {
        name: 'Emma Yogi',
        email: 'emma@example.com',
        password,
        bio: 'Yoga instructor helping people find balance. Seeking Spanish lessons for my next retreat.',
        skillsToTeach: ['Yoga', 'Meditation', 'Mindfulness'],
        skillsToLearn: ['Spanish', 'Bread Baking'],
        avatarColor: '#EC4899'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Successfully seeded ${createdUsers.length} users.`);

    // Create a match between Alice and Carlos (perfect match)
    const match = await Match.create({
      requester: createdUsers[0]._id, // Alice
      receiver: createdUsers[1]._id,  // Carlos
      status: 'accepted',
      teachSkill: 'React',
      learnSkill: 'Acoustic Guitar',
      message: "Hey Carlos! I'd love to swap some React knowledge for guitar lessons."
    });
    console.log('Seeded an active match between Alice and Carlos.');

    // Add some logs for Alice
    await ProgressLog.create([
      {
        user: createdUsers[0]._id,
        match: match._id,
        title: 'First Guitar Session',
        content: 'Learned the G, C, and D chords today. Fingers are a bit sore but it was fun!',
        skill: 'Acoustic Guitar',
        hoursSpent: 1.5,
        mood: 'great'
      },
      {
        user: createdUsers[0]._id,
        match: match._id,
        title: 'Mastering the Bar Chord',
        content: 'F chord is tough! Carlos gave some great tips on thumb positioning.',
        skill: 'Acoustic Guitar',
        hoursSpent: 2,
        mood: 'okay'
      }
    ]);
    console.log('Seeded journal entries for Alice.');

    console.log('\n✅ Seeding complete! You can now log in as alice@example.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
