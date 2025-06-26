
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Convert date strings back to Date objects
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            ...item,
            startDate: item.startDate ? new Date(item.startDate) : item.startDate,
            endDate: item.endDate ? new Date(item.endDate) : item.endDate,
            recurrence: item.recurrence ? {
              ...item.recurrence,
              endDate: item.recurrence.endDate ? new Date(item.recurrence.endDate) : item.recurrence.endDate
            } : item.recurrence
          }));
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
