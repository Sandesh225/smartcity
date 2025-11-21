// components/admin/notices/AdminNoticeFilters.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NoticeStatus, NoticeType } from "./types";

export interface NoticeFilters {
  search: string;
  status?: NoticeStatus;
  type?: NoticeType;
  featured?: boolean;
  urgent?: boolean;
}

interface AdminNoticeFiltersProps {
  onFilterChange?: (filters: NoticeFilters) => void;
}

export function AdminNoticeFilters({ onFilterChange }: AdminNoticeFiltersProps) {
  const [filters, setFilters] = useState<NoticeFilters>({
    search: "",
  });

  const updateFilter = (key: keyof NoticeFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const empty: NoticeFilters = { search: "" };
    setFilters(empty);
    onFilterChange?.(empty);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "search" && value !== undefined
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search notices..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="border-slate-700 bg-slate-950/70 pl-9 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            updateFilter("status", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[140px] border-slate-700 bg-slate-950/70 text-slate-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900">
            <SelectItem value="all" className="text-slate-100">
              All Status
            </SelectItem>
            <SelectItem value="published" className="text-slate-100">
              Published
            </SelectItem>
            <SelectItem value="draft" className="text-slate-100">
              Draft
            </SelectItem>
            <SelectItem value="archived" className="text-slate-100">
              Archived
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) =>
            updateFilter("type", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[160px] border-slate-700 bg-slate-950/70 text-slate-100">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900">
            <SelectItem value="all" className="text-slate-100">
              All Types
            </SelectItem>
            <SelectItem value="general" className="text-slate-100">
              General
            </SelectItem>
            <SelectItem value="tender" className="text-slate-100">
              Tender
            </SelectItem>
            <SelectItem value="public_hearing" className="text-slate-100">
              Public Hearing
            </SelectItem>
            <SelectItem value="emergency" className="text-slate-100">
              Emergency
            </SelectItem>
            <SelectItem value="event" className="text-slate-100">
              Event
            </SelectItem>
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-slate-700 text-slate-400 hover:text-slate-200"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0"
            >
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
}
