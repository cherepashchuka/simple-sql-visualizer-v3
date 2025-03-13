import { Table } from '../types';

const STORAGE_KEY = 'sql-visualizer-tables';

export const saveTables = (tables: Table[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  } catch (error) {
    console.error('Error saving tables to localStorage:', error);
  }
};

export const loadTables = (): Table[] => {
  try {
    const savedTables = localStorage.getItem(STORAGE_KEY);
    return savedTables ? JSON.parse(savedTables) : [];
  } catch (error) {
    console.error('Error loading tables from localStorage:', error);
    return [];
  }
};

export const clearTables = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tables from localStorage:', error);
  }
}; 