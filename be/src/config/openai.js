const { OpenAI } = require('openai');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a cache with TTL set to 24 hours (86400 seconds)
const quoteCache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

module.exports = { openai, quoteCache };