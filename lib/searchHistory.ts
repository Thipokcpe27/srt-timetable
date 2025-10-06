import { SearchParams } from './types';

const STORAGE_KEY = 'srt-search-history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem extends SearchParams {
  timestamp: number;
  id: string;
}

export const searchHistoryService = {
  getHistory(): SearchHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  },

  addToHistory(params: SearchParams): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      
      const newItem: SearchHistoryItem = {
        ...params,
        timestamp: Date.now(),
        id: Math.random().toString(36).substring(7),
      };

      const isDuplicate = history.some(
        item =>
          item.origin === params.origin &&
          item.destination === params.destination
      );

      if (isDuplicate) return;

      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  },

  removeFromHistory(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to remove from search history:', error);
    }
  },

  clearHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  },
};
