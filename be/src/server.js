const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const habitRoutes = require('./routes/habits');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quotesRoutes = require('./routes/quotes');

// Import models with associations
const models = require('./models');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Auth middleware for protected routes
const authMiddleware = require('./middleware/authMiddleware');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', authMiddleware, habitRoutes); // Protect all habit routes
app.use('/api/user', authMiddleware, userRoutes); // Protect all user routes
app.use('/api/quotes', quotesRoutes); // Quotes are public

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HabitVault API' });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Sync all models with associations
    // Using alter:true to fix missing columns
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully with schema updates');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer(); 