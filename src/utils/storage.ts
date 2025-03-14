import { Table } from '../types';

const TABLES_STORAGE_KEY = 'sql-visualizer-tables';
const CODE_STORAGE_KEY = 'sql-visualizer-code';
const LAST_ACTIVITY_KEY = 'sql-visualizer-last-activity';

// One hour in milliseconds
const INACTIVITY_THRESHOLD = 60 * 60 * 1000;

// Check if data should be auto-reset due to inactivity
export const checkAutoReset = (): boolean => {
  try {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;
    
    const lastActivityTime = parseInt(lastActivity, 10);
    const currentTime = Date.now();
    
    // If more than 1 hour has passed since last activity
    if (currentTime - lastActivityTime > INACTIVITY_THRESHOLD) {
      clearStorage();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking auto reset:', error);
    return false;
  }
};

// Update the last activity timestamp
export const updateLastActivity = (): void => {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error updating last activity timestamp:', error);
  }
};

export const saveTables = (tables: Table[]): void => {
  try {
    localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
    updateLastActivity();
  } catch (error) {
    console.error('Error saving tables to localStorage:', error);
  }
};

export const loadTables = (): Table[] => {
  try {
    // Check if we should auto-reset first
    if (checkAutoReset()) {
      return [];
    }
    
    const savedTables = localStorage.getItem(TABLES_STORAGE_KEY);
    updateLastActivity();
    return savedTables ? JSON.parse(savedTables) : [];
  } catch (error) {
    console.error('Error loading tables from localStorage:', error);
    return [];
  }
};

export const saveCode = (code: string): void => {
  try {
    localStorage.setItem(CODE_STORAGE_KEY, code);
    updateLastActivity();
  } catch (error) {
    console.error('Error saving code to localStorage:', error);
  }
};

export const loadCode = (): string => {
  try {
    // No need to check auto-reset here as loadTables will be called first
    const savedCode = localStorage.getItem(CODE_STORAGE_KEY);
    updateLastActivity();
    return savedCode || '';
  } catch (error) {
    console.error('Error loading code from localStorage:', error);
    return '';
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(TABLES_STORAGE_KEY);
    localStorage.removeItem(CODE_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch (error) {
    console.error('Error clearing data from localStorage:', error);
  }
};

// Get the remaining time until auto-reset in minutes
export const getTimeUntilReset = (): number | null => {
  try {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return null;
    
    const lastActivityTime = parseInt(lastActivity, 10);
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastActivityTime;
    
    // If already expired, return 0
    if (elapsedTime >= INACTIVITY_THRESHOLD) {
      return 0;
    }
    
    // Return remaining time in minutes
    const remainingTimeMs = INACTIVITY_THRESHOLD - elapsedTime;
    return Math.ceil(remainingTimeMs / (60 * 1000));
  } catch (error) {
    console.error('Error calculating time until reset:', error);
    return null;
  }
}; 