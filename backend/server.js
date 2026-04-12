const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/logs', require('./routes/logs'));

app.get('/', (req, res) => res.json({ message: 'SkillNest API is running 🌿' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\n🌿 SkillNest server running on http://localhost:${PORT}\n`));
