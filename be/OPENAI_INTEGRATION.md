# OpenAI Integration for Daily Motivational Quotes

This document explains the integration of OpenAI's GPT models to generate fresh motivational quotes for the HabitVault application.

## Implementation Details

The `/api/quotes/daily` endpoint now uses OpenAI's GPT-4 model to generate a unique motivational quote each day about habits and consistency.

### Key Features:

1. **Daily Generation**: A new quote is generated once per day and cached.
2. **Caching**: Uses `node-cache` with a 24-hour TTL to avoid unnecessary API calls.
3. **Fallback Mechanism**: If the OpenAI API call fails, the system falls back to the static quote list.
4. **Consistent Format**: The response format matches the existing API structure.

## Configuration

To enable this feature, you need to add your OpenAI API key to the `.env` file:

```
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key
```

## Dependencies Added

- `openai`: The official OpenAI Node.js library
- `node-cache`: A simple in-memory caching solution

## How It Works

1. When a request is made to `/api/quotes/daily`, the system checks if there's a cached quote for today.
2. If no cached quote exists, it calls the OpenAI API with a carefully crafted prompt.
3. The generated quote is cleaned (removing quotation marks if present) and cached for 24 hours.
4. If the API call fails, it falls back to the deterministic quote selection from the static list.

## Prompt Engineering

The prompt used is:
"Give me a short motivational quote about building good habits and staying consistent. It should sound inspiring, ideally under 20 words."

This prompt is designed to generate concise, impactful quotes specifically about habit formation and consistency. 