import { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UseMenuOptions {
  category?: MenuCategory | 'all';
  search?: string;
  featured?: boolean;
}

export const useMenu = (options: UseMenuOptions = {}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, [options.category, options.search, options.featured]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (options.category && options.category !== 'all') {
        params.append('category', options.category);
      }
      
      if (options.search) {
        params.append('search', options.search);
      }

      const url = `${API_URL}/api/menu${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      const data: MenuItem[] = await response.json();

      // Filter featured items on frontend if needed
      let filteredData = data;
      
      if (options.featured) {
        // Take first 6 items as featured (you can add backend logic later)
        filteredData = data.filter(item => item.available).slice(0, 6);
      }

      setMenuItems(filteredData);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchMenuItems();
  };

  return {
    menuItems,
    loading,
    error,
    refetch,
  };
};