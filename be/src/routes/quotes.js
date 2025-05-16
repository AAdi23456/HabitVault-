const express = require('express');
const router = express.Router();

// Array of motivational quotes
const quotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "It's not about perfect. It's about effort.",
    author: "Jillian Michaels"
  },
  {
    text: "Don't wait. The time will never be just right.",
    author: "Napoleon Hill"
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill"
  },
  {
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson"
  },
  {
    text: "Habits are first cobwebs, then cables.",
    author: "Spanish Proverb"
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun"
  },
  {
    text: "Make each day your masterpiece.",
    author: "John Wooden"
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
  },
  {
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    text: "The habit of persistence is the habit of victory.",
    author: "Herbert Kaufman"
  },
  {
    text: "Impossible is just an opinion.",
    author: "Paulo Coelho"
  },
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe"
  },
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown"
  }
];

// Get a quote of the day
router.get('/daily', (req, res) => {
  try {
    // Get the current date in a consistent format for the seed
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Use the date as a seed to get a consistent quote for the whole day
    const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const quoteIndex = seed % quotes.length;
    
    res.json({
      success: true,
      quote: quotes[quoteIndex]
    });
  } catch (error) {
    console.error('Get daily quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily quote'
    });
  }
});

// Get a random quote
router.get('/random', (req, res) => {
  try {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    
    res.json({
      success: true,
      quote: quotes[randomIndex]
    });
  } catch (error) {
    console.error('Get random quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching random quote'
    });
  }
});

// Get all quotes
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      quotes
    });
  } catch (error) {
    console.error('Get all quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotes'
    });
  }
});

module.exports = router; 