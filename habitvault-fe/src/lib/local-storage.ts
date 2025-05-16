// Constants for localStorage keys
const DARK_MODE_KEY = 'habitvault-darkmode';
const TIME_RANGE_KEY = 'habitvault-timerange';
const SHOW_QUOTES_KEY = 'habitvault-show-quotes';

// UserPreferences interface
export interface UserPreferences {
  darkMode: boolean;
  analyticsTimeRange: 'week' | 'month' | 'year';
  showMotivationalQuotes: boolean;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  darkMode: false,
  analyticsTimeRange: 'week',
  showMotivationalQuotes: true,
};

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const darkMode = localStorage.getItem(DARK_MODE_KEY);
    const timeRange = localStorage.getItem(TIME_RANGE_KEY) as 'week' | 'month' | 'year';
    const showQuotes = localStorage.getItem(SHOW_QUOTES_KEY);
    
    return {
      darkMode: darkMode ? darkMode === 'true' : DEFAULT_PREFERENCES.darkMode,
      analyticsTimeRange: timeRange || DEFAULT_PREFERENCES.analyticsTimeRange,
      showMotivationalQuotes: showQuotes ? showQuotes === 'true' : DEFAULT_PREFERENCES.showMotivationalQuotes,
    };
  } catch (error) {
    console.error('Error getting user preferences from localStorage:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save dark mode preference to localStorage
 */
export function saveDarkMode(isDarkMode: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString());
  } catch (error) {
    console.error('Error saving dark mode to localStorage:', error);
  }
}

/**
 * Save analytics time range preference to localStorage
 */
export function saveTimeRange(timeRange: 'week' | 'month' | 'year'): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(TIME_RANGE_KEY, timeRange);
  } catch (error) {
    console.error('Error saving time range to localStorage:', error);
  }
}

/**
 * Save motivational quotes preference to localStorage
 */
export function saveShowQuotes(showQuotes: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SHOW_QUOTES_KEY, showQuotes.toString());
  } catch (error) {
    console.error('Error saving quotes preference to localStorage:', error);
  }
}

/**
 * Save all user preferences to localStorage
 */
export function saveUserPreferences(preferences: UserPreferences): void {
  if (typeof window === 'undefined') return;
  
  try {
    saveDarkMode(preferences.darkMode);
    saveTimeRange(preferences.analyticsTimeRange);
    saveShowQuotes(preferences.showMotivationalQuotes);
  } catch (error) {
    console.error('Error saving user preferences to localStorage:', error);
  }
} 