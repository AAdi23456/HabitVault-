const express = require('express');
const router = express.Router();
const { openai, quoteCache } = require('../config/openai');

// Array of motivational quotes (fallback)
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

/**
 * Generate a new motivational quote using OpenAI
 * @returns {Promise<Object>} The generated quote object
 */
async function generateOpenAIQuote() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or "gpt-3.5-turbo" depending on your subscription
      messages: [
        {
          role: "system",
          content: "You are a motivational quote generator."
        },
        {
          role: "user",
          content: "Give me a short motivational quote about building good habits and staying consistent. It should sound inspiring, ideally under 20 words."
        }
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    // Extract the generated quote text
    const quoteText = completion.choices[0].message.content.trim();
    
    // Strip quotation marks if present
    const cleanQuote = quoteText.replace(/^["']|["']$/g, '');
    
    return {
      text: cleanQuote,
      author: "OpenAI"
    };
  } catch (error) {
    console.error('OpenAI quote generation error:', error);
    // Return null to indicate failure, will trigger fallback mechanism
    return null;
  }
}

// Get a motivational quote of the day using OpenAI
router.get('/daily', async (req, res) => {
  try {
    // Generate date string for today (YYYY-MM-DD format)
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const cacheKey = `daily_quote_${dateString}`;
    
    // Check if quote for today is already in cache
    let quote = quoteCache.get(cacheKey);
    
    if (!quote) {
      console.log('No cached quote found for today, generating new one with OpenAI');
      
      // Generate a new quote from OpenAI
      quote = await generateOpenAIQuote();
      
      // If OpenAI failed, fall back to a random quote from the static list
      if (!quote) {
        console.log('Falling back to static quote');
        const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const quoteIndex = seed % quotes.length;
        quote = quotes[quoteIndex];
      }
      
      // Cache the quote for today
      quoteCache.set(cacheKey, quote);
    }
    
    res.json({
      success: true,
      quote
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