// components/citizen/notices/CitizenNoticesClient.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Filter,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import type { CitizenNoticeRow } from "@/app/(citizen)/citizen/notices/page";

type WardRow = {
  id: string;
  ward_number: number;
  ward_name: string | null;
};

type NoticeTypeFilter =
  | "all"
  | "general"
  | "tender"
  | "public_hearing"
  | "emergency"
  | "event";

type Filters = {
  search: string;
  type: NoticeTypeFilter;
};

interface Props {
  initialNotices: CitizenNoticeRow[];
  wards: WardRow[];
  // REMOVED: userWardId: string | null;
}

const noticeTypeLabels: Record<
  Exclude<NoticeTypeFilter, "all">,
  string
> = {
  general: "General",
  tender: "Tender",
  public_hearing: "Public Hearing",
  emergency: "Emergency",
  event: "Event",
};

function getWardsForNotice(
  notice: CitizenNoticeRow,
  wards: WardRow[]
): WardRow[] {
  const ids = notice.related_ward_ids;
  if (!ids || ids.length === 0) return [];
  return wards.filter((w) => ids.includes(w.id));
}

function applyFilters(
  notices: CitizenNoticeRow[],
  filters: Filters,
): CitizenNoticeRow[] {
  const search = filters.search.trim().toLowerCase();

  return notices.filter((n) => {
    // Text search
    if (search) {
      const haystack =
        `${n.title ?? ""} ${n.content ?? ""} ${n.title_nepali ?? ""} ${
          n.content_nepali ?? ""
        }`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    // Type
    if (filters.type !== "all" && n.notice_type !== filters.type) {
      return false;
    }

    return true;
  });
}

export function CitizenNoticesClient({
  initialNotices,
  wards,
}: Props) { // REMOVED: userWardId
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "all",
  });

  const filteredNotices = useMemo(
    () => applyFilters(initialNotices, filters),
    [initialNotices, filters]
  );

  const hasActiveFilters = !!filters.search.trim().length || filters.type !== "all";

  return (
    <section className="space-y-5">
      {/* Filter Bar - REMOVED "My Ward Only" toggle */}
      <Card className="border-glass-soft bg-surface-elevated/80 shadow-glass-md backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-sm text-slate-50">
              Filter notices
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Showing {filteredNotices.length} notice
            {filteredNotices.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilters && "(filtered)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }))
              }
              placeholder="Search by title or content..."
              className="w-full border-slate-700 bg-slate-950/70 pl-9 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Type filter */}
          <Select
            value={filters.type}
            onValueChange={(val: NoticeTypeFilter) =>
              setFilters((prev) => ({ ...prev, type: val }))
            }
          >
            <SelectTrigger className="border-slate-700 bg-slate-950/70 text-xs text-slate-100">
              <SelectValue placeholder="Notice type" />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900 text-xs text-slate-100">
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(noticeTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notices list - unchanged */}
      {filteredNotices.length === 0 ? (
        <Card className="border-glass-soft bg-surface-deep/80 text-center text-sm text-slate-400">
          <CardContent className="py-10">
            No notices found for the current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => {
            const wardsForNotice = getWardsForNotice(notice, wards);
            const isCitywide = wardsForNotice.length === 0;

            return (
              <Link
                key={notice.id}
                href={`/citizen/notices/${notice.slug}`}
                className="block rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3 shadow-glass-sm transition hover:border-emerald-500/60 hover:bg-slate-950"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-4">
                  {/* Left: badges + title */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Type badge */}
                      <Badge
                        variant="outline"
                        className="border-slate-700 bg-slate-900/60 text-[10px] uppercase tracking-wide text-slate-300"
                      >
                        {noticeTypeLabels[notice.notice_type]}
                      </Badge>

                      {notice.is_urgent && (
                        <Badge className="bg-red-700/80 text-[10px] font-semibold text-red-50">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                      {notice.is_featured && (
                        <Badge className="bg-emerald-700/80 text-[10px] font-semibold text-emerald-50">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      )}

                      {notice.published_date && (
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(notice.published_date), "dd MMM yyyy")}
                        </span>
                      )}
                    </div>

                    <h2 className="line-clamp-1 text-sm font-semibold text-slate-50">
                      {notice.title}
                    </h2>
                    {notice.title_nepali && (
                      <p className="line-clamp-1 text-[11px] text-slate-300">
                        {notice.title_nepali}
                      </p>
                    )}
                    <p className="line-clamp-2 text-[11px] text-slate-400">
                      {notice.content}
                    </p>
                  </div>

                  {/* Right: targeting + CTA */}
                  <div className="flex w-full flex-row items-end justify-between gap-3 md:w-[220px] md:flex-col md:items-end md:justify-between">
                    <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                      {isCitywide ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-700/60 bg-emerald-900/40 text-[10px] text-emerald-200"
                        >
                          <MapPin className="mr-1 h-3 w-3" />
                          All wards
                        </Badge>
                      ) : (
                        wardsForNotice.map((w) => (
                          <Badge
                            key={w.id}
                            variant="outline"
                            className="border-slate-700 bg-slate-900/60 text-[10px] text-slate-200"
                          >
                            <MapPin className="mr-1 h-3 w-3" />
                            Ward {w.ward_number}
                          </Badge>
                        ))
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-emerald-400 md:text-right">
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}