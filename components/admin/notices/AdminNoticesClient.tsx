// components/admin/notices/AdminNoticesClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AdminNoticeCard } from "./AdminNoticeCard";
import { AdminNoticeEmptyState } from "./AdminNoticeEmptyState";
import { AdminNoticeFilters, NoticeFilters } from "./AdminNoticeFilters";
import type {
  NoticeRow,
  WardOption,
  DepartmentOption,
  NoticeStatus,
} from "./types";
import {
  updateNoticeStatusAction,
  deleteNoticeAction,
} from "@/app/(admin)/admin/notices/actions";

interface AdminNoticesClientProps {
  initialRows: NoticeRow[];
  wards: WardOption[];
  departments: DepartmentOption[];
}

function applyFilters(rows: NoticeRow[], filters: NoticeFilters): NoticeRow[] {
  const search = filters.search.trim().toLowerCase();

  return rows.filter((n) => {
    if (search) {
      const haystack = `${n.title ?? ""} ${n.content ?? ""} ${
        n.title_nepali ?? ""
      }`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (filters.status && n.status !== filters.status) return false;
    if (filters.type && n.notice_type !== filters.type) return false;

    if (filters.featured === true && !n.is_featured) return false;
    if (filters.urgent === true && !n.is_urgent) return false;

    return true;
  });
}

export function AdminNoticesClient({
  initialRows,
  wards,
  departments,
}: AdminNoticesClientProps) {
  const [filters, setFilters] = useState<NoticeFilters>({ search: "" });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredRows = useMemo(
    () => applyFilters(initialRows, filters),
    [initialRows, filters]
  );

  const stats = useMemo(() => {
    const base = filteredRows;
    return {
      total: base.length,
      published: base.filter((n) => n.status === "published").length,
      draft: base.filter((n) => n.status === "draft").length,
      urgent: base.filter((n) => n.is_urgent).length,
      featured: base.filter((n) => n.is_featured).length,
    };
  }, [filteredRows]);

  const hasActiveFilters =
    !!filters.status ||
    !!filters.type ||
    !!filters.featured ||
    !!filters.urgent ||
    filters.search.trim().length > 0;

  const handleStatusChange = (id: string, nextStatus: NoticeStatus) => {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("nextStatus", nextStatus);

    startTransition(async () => {
      try {
        await updateNoticeStatusAction(formData);
        router.refresh();
      } catch (err) {
        console.error("Status change failed", err);
        // TODO: hook into toast system
      }
    });
  };

  const handleDelete = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      try {
        await deleteNoticeAction(formData);
        router.refresh();
      } catch (err) {
        console.error("Delete notice failed", err);
        // TODO: hook into toast system
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Notices &amp; Announcements
          </h1>
          <p className="text-sm text-slate-400">
            Manage all city-wide notices that appear in the Citizen Portal.
          </p>
        </div>
        <Link href="/admin/notices/new">
          <Button className="bg-emerald-600 text-slate-950 hover:bg-emerald-500">
            <Plus className="mr-2 h-4 w-4" />
            New Notice
          </Button>
        </Link>
      </div>

      {/* Stats Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-slate-800 bg-slate-950/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">
              Total Notices
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-100">
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-slate-800 bg-slate-950/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">
              Published
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-400">
              {stats.published}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-slate-800 bg-slate-950/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">
              Draft
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-400">
              {stats.draft}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-slate-800 bg-slate-950/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">
              Urgent
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-400">
              {stats.urgent}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-slate-800 bg-slate-950/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">
              Featured
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-100">
              {stats.featured}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-800 bg-slate-950/70 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-sm text-slate-100">
              Filter notices
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <AdminNoticeFilters onFilterChange={setFilters} />
        </CardContent>
      </Card>

      {/* Notices Grid / Empty */}
      {filteredRows.length === 0 ? (
        <AdminNoticeEmptyState />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {filteredRows.length} notice
              {filteredRows.length !== 1 ? "s" : ""}
              {hasActiveFilters && " (filtered)"}
            </p>
            {isPending && (
              <p className="text-xs text-slate-500">Updating…</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRows.map((notice) => (
              <AdminNoticeCard
                key={notice.id}
                notice={notice}
                wards={wards}
                departments={departments}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
