import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../api';

export type SortOption = 
  | 'recent'
  | 'highest_return'
  | 'lowest_return'
  | 'most_slots'
  | 'least_slots'
  | 'most_active'
  | 'alphabetical';

export type FilterOption = 'all' | 'available' | 'favorites';

export function useAvailableGroups() {
  const [originalGroups, setOriginalGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('highest_return');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  
  // Persisted Favorites (Mocked for now in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('@ajudaae:favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.getAdminGroups();
      setOriginalGroups(res.groups || []);
    } catch (err) {
      console.error('Error loading available groups:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Persist favorites when they change
  useEffect(() => {
    try {
      localStorage.setItem('@ajudaae:favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Could not save favorites', e);
    }
  }, [favorites]);

  const toggleFavorite = useCallback((groupId: string) => {
    setFavorites(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  // Compute processed groups based on search, filter, and sort
  const processedGroups = useMemo(() => {
    let result = [...originalGroups];

    // 1. Search Query (Case Insensitive on name, id, category)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(g => 
        g.nome_grupo?.toLowerCase().includes(query) ||
        g.id?.toLowerCase().includes(query)
      );
    }

    // 2. Status/Category Filter
    if (filterStatus === 'favorites') {
      result = result.filter(g => favorites.includes(g.id));
    } else if (filterStatus === 'available') {
      // Mock for 'available slots' (since our current API returns groups that might be full)
      // We assume a group has max 4 members. If it has less, it's available.
      result = result.filter(g => !g.members || g.members.length < 4);
    }

    // 3. Sorting
    result.sort((a, b) => {
      const returnA = a.valor_base && a.valor_ativacao ? a.valor_base / a.valor_ativacao : 0;
      const returnB = b.valor_base && b.valor_ativacao ? b.valor_base / b.valor_ativacao : 0;
      const slotsA = 4 - (a.members?.length || 0);
      const slotsB = 4 - (b.members?.length || 0);

      switch (sortBy) {
        case 'highest_return':
          return returnB - returnA; // Descending
        case 'lowest_return':
          return returnA - returnB; // Ascending
        case 'most_slots':
          return slotsB - slotsA;
        case 'least_slots':
          return slotsA - slotsB;
        case 'alphabetical':
          return (a.nome_grupo || '').localeCompare(b.nome_grupo || '');
        case 'recent':
        case 'most_active':
        default:
          // Fallback to ID comparison as a mock for creation date
          return b.id.localeCompare(a.id);
      }
    });

    return result;
  }, [originalGroups, searchQuery, filterStatus, sortBy, favorites]);

  return {
    groups: processedGroups,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterStatus,
    setFilterStatus,
    favorites,
    toggleFavorite,
    refresh: loadGroups
  };
}
