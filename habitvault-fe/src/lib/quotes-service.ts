// Import API configuration
import { API_ENDPOINTS, apiUtils } from "./api-config";

// Quote interface
export interface Quote {
  text: string;
  author: string;
}

/**
 * Fetch the daily motivational quote
 */
export async function getDailyQuote(): Promise<Quote | null> {
  try {
    const response = await fetch(API_ENDPOINTS.QUOTES.DAILY, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch daily quote: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.quote;
    } else {
      console.error('Failed to fetch daily quote:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching daily quote:', error);
    return null;
  }
}

/**
 * Fetch a random motivational quote
 */
export async function getRandomQuote(): Promise<Quote | null> {
  try {
    const response = await fetch(API_ENDPOINTS.QUOTES.RANDOM, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch random quote: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.quote;
    } else {
      console.error('Failed to fetch random quote:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching random quote:', error);
    return null;
  }
}

/**
 * Fetch all motivational quotes
 */
export async function getAllQuotes(): Promise<Quote[] | null> {
  try {
    const response = await fetch(API_ENDPOINTS.QUOTES.ALL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch quotes: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.quotes;
    } else {
      console.error('Failed to fetch quotes:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return null;
  }
} 