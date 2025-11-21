// components/citizen/notices/CitizenDashboardNotices.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  MapPin,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { supabaseBrowser } from "@/lib/supabaseClient";

type NoticeRow = {
  id: string;
  title: string;
  title_nepali: string | null;
  content: string;
  slug: string;
  is_urgent: boolean;
  is_featured: boolean;
  published_date: string | null;
  related_ward_ids: string[] | null;
  notice_type: "general" | "tender" | "public_hearing" | "emergency" | "event";
};

type CitizenDashboardNoticesProps = {
  initialNotices?: NoticeRow[];
};

const typeLabels: Record<NoticeRow["notice_type"], string> = {
  general: "General",
  tender: "Tender",
  public_hearing: "Public Hearing",
  emergency: "Emergency",
  event: "Event",
};

export function CitizenDashboardNotices({
  initialNotices = [],
}: CitizenDashboardNoticesProps) {
  const [notices, setNotices] = useState<NoticeRow[]>(initialNotices);
  const [loading, setLoading] = useState(initialNotices.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have initial notices from server, use them
    if (initialNotices.length > 0) {
      console.log('Using initial notices:', initialNotices.length);
      setNotices(initialNotices);
      setLoading(false);
      return;
    }

    // Only fetch on client if no initial notices were provided
    async function fetchNotices() {
      try {
        console.log('Fetching notices on client...');
        const supabase = supabaseBrowser;

        const { data, error: fetchError } = await supabase
          .from("notices")
          .select(
            "id, title, title_nepali, content, slug, is_urgent, is_featured, published_date, related_ward_ids, notice_type"
          )
          .eq("status", "published")
          .or("expiry_date.is.null,expiry_date.gt.now()")
          .order("published_date", { ascending: false })
          .limit(10);

        if (fetchError) {
          console.error("Supabase fetch error:", fetchError);
          throw fetchError;
        }

        console.log('Fetched notices on client:', data?.length);
        setNotices(data || []);
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError("Failed to load notices");
      } finally {
        setLoading(false);
      }
    }

    fetchNotices();
  }, [initialNotices]);

  if (loading) {
    return (
      <Card className="border-glass-soft bg-surface-elevated/80 shadow-glass-md backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base text-slate-50">
              Latest Notices
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-slate-800/50"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-glass-soft bg-surface-elevated/80 shadow-glass-md backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base text-slate-50">
              Latest Notices
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-rose-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Debug: Check what notices we have to display
  console.log('Notices to display:', notices.length);

  if (notices.length === 0) {
    return (
      <Card className="border-glass-soft bg-surface-elevated/80 shadow-glass-md backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base text-slate-50">
              Latest Notices
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-3 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-400">
              No notices available at the moment
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check back later for updates from the city administration.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Separate notices by priority
  const urgentNotices = notices.filter(n => n.is_urgent);
  const featuredNotices = notices.filter(n => n.is_featured && !n.is_urgent);
  const regularNotices = notices.filter(n => !n.is_urgent && !n.is_featured);

  return (
    <Card className="border-glass-soft bg-surface-elevated/80 shadow-glass-md backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-400" />
          <CardTitle className="text-base text-slate-50">
            Latest Notices ({notices.length})
          </CardTitle>
        </div>
        <Link
          href="/citizen/notices"
          className="text-xs text-emerald-400 hover:text-emerald-300"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Urgent Notices */}
        {urgentNotices.slice(0, 1).map((notice) => (
          <Link
            key={notice.id}
            href={`/citizen/notices/${notice.slug}`}
            className="block"
          >
            <div className="rounded-lg border border-red-700/60 bg-gradient-to-r from-red-950/60 to-red-900/40 p-3 shadow-lg transition hover:border-red-600/80 hover:shadow-xl">
              <div className="mb-2 flex items-start justify-between gap-2">
                <Badge className="bg-red-700/90 text-[10px] font-semibold text-red-50">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  URGENT
                </Badge>
                <span className="text-[10px] text-red-200">
                  {notice.published_date &&
                    format(
                      new Date(notice.published_date),
                      "dd MMM yyyy"
                    )}
                </span>
              </div>
              <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-50">
                {notice.title}
              </h3>
              {notice.title_nepali && (
                <p className="mb-1 line-clamp-1 text-[11px] text-red-100">
                  {notice.title_nepali}
                </p>
              )}
              <p className="line-clamp-2 text-[11px] text-slate-300">
                {notice.content}
              </p>
            </div>
          </Link>
        ))}

        {/* Featured Notices */}
        {featuredNotices.slice(0, 2).map((notice) => (
          <Link
            key={notice.id}
            href={`/citizen/notices/${notice.slug}`}
            className="block rounded-lg border border-emerald-800/60 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 p-3 transition hover:border-emerald-700/80 hover:bg-slate-900/80"
          >
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className="bg-emerald-800/80 text-[9px] font-medium text-emerald-100">
                  <Star className="mr-0.5 h-2.5 w-2.5" />
                  Featured
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-700 bg-slate-900/60 text-[9px] text-slate-300"
                >
                  {typeLabels[notice.notice_type]}
                </Badge>
              </div>
              <span className="text-[10px] text-slate-400">
                {notice.published_date &&
                  format(new Date(notice.published_date), "dd MMM")}
              </span>
            </div>
            <h3 className="mb-0.5 line-clamp-1 text-sm font-medium text-slate-100">
              {notice.title}
            </h3>
            <p className="line-clamp-2 text-[11px] text-slate-400">
              {notice.content}
            </p>
          </Link>
        ))}

        {/* Regular Notices */}
        {regularNotices.slice(0, 3).map((notice) => {
          const isCitywide = !notice.related_ward_ids || notice.related_ward_ids.length === 0;

          return (
            <Link
              key={notice.id}
              href={`/citizen/notices/${notice.slug}`}
              className="flex items-start gap-2 rounded-lg border border-slate-800/60 bg-slate-950/60 p-2.5 transition hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="line-clamp-1 text-xs font-medium text-slate-200">
                    {notice.title}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="border-slate-700 bg-slate-900/60 text-[9px] text-slate-300"
                  >
                    {typeLabels[notice.notice_type]}
                  </Badge>
                  {isCitywide && (
                    <Badge
                      variant="outline"
                      className="border-emerald-800/60 bg-emerald-950/40 text-[9px] text-emerald-300"
                    >
                      <MapPin className="mr-0.5 h-2.5 w-2.5" />
                      Citywide
                    </Badge>
                  )}
                  {notice.published_date && (
                    <span className="flex items-center gap-0.5 text-[9px] text-slate-500">
                      <Calendar className="h-2.5 w-2.5" />
                      {format(new Date(notice.published_date), "dd MMM")}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
            </Link>
          );
        })}

        {/* View All Link */}
        <div className="pt-2">
          <Link
            href="/citizen/notices"
            className="flex items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 py-2 text-xs font-medium text-emerald-400 transition hover:border-emerald-700/60 hover:bg-slate-900/80 hover:text-emerald-300"
          >
            View all notices
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}