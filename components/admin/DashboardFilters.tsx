// components/admin/DashboardFilters.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Ward {
  ward_id: string;
  ward_name: string;
  ward_number: number;
}

interface Department {
  department_id: string;
  department_name: string;
}

interface Category {
  category_id: string;
  category_name: string;
}

interface DashboardFiltersProps {
  wards: Ward[];
  departments: Department[];
  categories: Category[];
  currentFilters: {
    timeRange: string;
    wardId?: string;
    departmentId?: string;
    categoryId?: string;
  };
}

export function DashboardFilters({
  wards,
  departments,
  categories,
  currentFilters,
}: DashboardFiltersProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(currentFilters);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.timeRange) params.set("time_range", filters.timeRange);
    if (filters.wardId) params.set("ward_id", filters.wardId);
    if (filters.departmentId)
      params.set("department_id", filters.departmentId);
    if (filters.categoryId) params.set("category_id", filters.categoryId);

    router.push(`/admin?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      timeRange: "week",
      wardId: undefined,
      departmentId: undefined,
      categoryId: undefined,
    });
    router.push("/admin");
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h2 className="card-title text-sm">Dashboard Filters</h2>
        <button onClick={clearFilters} className="chip hover:bg-red-500/20">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-muted mb-2">Time Range</label>
          <select
            value={filters.timeRange}
            onChange={(e) =>
              setFilters({ ...filters, timeRange: e.target.value })
            }
            className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-2">Ward</label>
          <select
            value={filters.wardId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                wardId: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm"
          >
            <option value="">All Wards</option>
            {wards.map((ward) => (
              <option key={ward.ward_id} value={ward.ward_id}>
                Ward {ward.ward_number} - {ward.ward_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-2">Department</label>
          <select
            value={filters.departmentId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                departmentId: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-2">Category</label>
          <select
            value={filters.categoryId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                categoryId: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={applyFilters} className="btn-primary">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
