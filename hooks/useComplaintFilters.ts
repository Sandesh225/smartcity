

// hooks/useComplaintFilters.ts
import { useState, useMemo } from 'react';
import type { Complaint } from './useCitizenComplaints';

export type ComplaintFilters = {
  search: string;
  status: string[];
  category: string[];
  ward: string[];
  priority: string[];
  dateFrom: string;
  dateTo: string;
};

export function useComplaintFilters(complaints: Complaint[]) {
  const [filters, setFilters] = useState<ComplaintFilters>({
    search: '',
    status: [],
    category: [],
    ward: [],
    priority: [],
    dateFrom: '',
    dateTo: '',
  });

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          c.tracking_id.toLowerCase().includes(search) ||
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(c.status)) {
        return false;
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(c.category_id)) {
        return false;
      }

      // Ward filter
      if (filters.ward.length > 0 && !filters.ward.includes(c.ward_id)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(c.priority)) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const created = new Date(c.created_at);
        const from = new Date(filters.dateFrom);
        if (created < from) return false;
      }

      if (filters.dateTo) {
        const created = new Date(c.created_at);
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (created > to) return false;
      }

      return true;
    });
  }, [complaints, filters]);

  const updateFilter = <K extends keyof ComplaintFilters>(
    key: K,
    value: ComplaintFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: [],
      category: [],
      ward: [],
      priority: [],
      dateFrom: '',
      dateTo: '',
    });
  };

  return { filters, filtered, updateFilter, resetFilters };
}