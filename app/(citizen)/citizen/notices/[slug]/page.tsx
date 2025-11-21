// app/(citizen)/citizen/notices/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  Building2,
} from "lucide-react";

import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

type PageParams = {
  params: { slug: string };
};

type NoticeRow = {
  id: string;
  title: string;
  title_nepali: string | null;
  content: string;
  content_nepali: string | null;
  notice_type: "general" | "tender" | "public_hearing" | "emergency" | "event";
  status: "draft" | "published" | "archived";
  published_date: string | null;
  expiry_date: string | null;
  is_featured: boolean;
  is_urgent: boolean;
  tags: string[] | null;
  related_ward_ids: string[] | null;
  related_department_id: string | null;
  slug: string;
};

type WardRow = {
  id: string;
  ward_number: number;
  ward_name: string | null;
};

type DepartmentRow = {
  id: string;
  department_name: string;
};

const typeLabels: Record<NoticeRow["notice_type"], string> = {
  general: "General notice",
  tender: "Tender",
  public_hearing: "Public hearing",
  emergency: "Emergency alert",
  event: "Event",
};

export default async function CitizenNoticeDetailPage({ params }: PageParams) {
  const { slug } = params;

  const { supabase, profile } = await requireSessionAndProfile(
    `/citizen/notices/${slug}`
  );

  const wardId = (profile.ward_id as string | null) ?? null;

  const { data: notice, error } = await supabase
    .from("notices")
    .select(
      [
        "id",
        "title",
        "title_nepali",
        "content",
        "content_nepali",
        "notice_type",
        "status",
        "published_date",
        "expiry_date",
        "is_featured",
        "is_urgent",
        "tags",
        "related_ward_ids",
        "related_department_id",
        "slug",
      ].join(",")
    )
    .eq("slug", slug)
    .eq("status", "published")
    .or("expiry_date.is.null,expiry_date.gt.now()")
    .maybeSingle();

  if (error) {
    console.error("CitizenNoticeDetailPage error", error);
  }

  if (!notice) {
    notFound();
  }

  const typedNotice = notice as NoticeRow;

  const [{ data: wardsData }, { data: departmentsData }] = await Promise.all([
    supabase
      .from("wards")
      .select("id, ward_number, ward_name")
      .eq("is_active", true)
      .order("ward_number"),
    supabase
      .from("departments")
      .select("id, department_name")
      .order("department_name"),
  ]);

  const wards = (wardsData || []) as WardRow[];
  const departments = (departmentsData || []) as DepartmentRow[];

  const isCitywide =
    !typedNotice.related_ward_ids ||
    typedNotice.related_ward_ids.length === 0;

  const wardsForNotice = isCitywide
    ? []
    : wards.filter((w) =>
        typedNotice.related_ward_ids!.includes(w.id as string)
      );

  const department = typedNotice.related_department_id
    ? departments.find((d) => d.id === typedNotice.related_department_id)
    : null;

  // If user has no ward_id, treat as applicable (don’t scare them with “other wards”)
  const appliesToCurrentWard =
    !typedNotice.related_ward_ids ||
    typedNotice.related_ward_ids.length === 0 ||
    !wardId ||
    typedNotice.related_ward_ids.includes(wardId);

  return (
    <main className="space-y-6 px-4 py-6 md:px-6 md:py-8 lg:space-y-10">
      {/* Back links */}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <Link
          href="/citizen/notices"
          className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1 text-[11px] font-medium text-slate-200 hover:border-emerald-500/60 hover:text-emerald-200"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to notices
        </Link>
        <Link
          href="/citizen/dashboard"
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300"
        >
          Go to dashboard
        </Link>
      </div>

      {/* Hero card */}
      <Card className="border-glass-soft bg-surface-elevated/85 shadow-glass-md backdrop-blur">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type */}
            <Badge
              variant="outline"
              className="border-slate-700 bg-slate-900/70 text-[10px] uppercase tracking-wide text-slate-200"
            >
              {typeLabels[typedNotice.notice_type]}
            </Badge>

            {typedNotice.is_urgent && (
              <Badge className="bg-red-700/85 text-[10px] font-semibold text-red-50">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Urgent
              </Badge>
            )}

            {typedNotice.is_featured && (
              <Badge className="bg-emerald-700/85 text-[10px] font-semibold text-emerald-50">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}

            {typedNotice.published_date && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                <Calendar className="h-3 w-3" />
                {format(
                  new Date(typedNotice.published_date),
                  "dd MMM yyyy, HH:mm"
                )}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-slate-50">
              {typedNotice.title}
            </CardTitle>
            {typedNotice.title_nepali && (
              <CardDescription className="text-sm text-slate-200">
                {typedNotice.title_nepali}
              </CardDescription>
            )}
          </div>

          {/* Targeting info */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
            {isCitywide ? (
              <Badge
                variant="outline"
                className="border-emerald-700/70 bg-emerald-900/40 text-[10px] text-emerald-200"
              >
                <MapPin className="mr-1 h-3 w-3" />
                Applies to all wards
              </Badge>
            ) : (
              <>
                {wardsForNotice.map((w) => (
                  <Badge
                    key={w.id}
                    variant="outline"
                    className="border-slate-700 bg-slate-900/60 text-[10px] text-slate-100"
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    Ward {w.ward_number}
                    {w.ward_name ? ` – ${w.ward_name}` : ""}
                  </Badge>
                ))}
              </>
            )}

            {department && (
              <Badge
                variant="outline"
                className="border-slate-700 bg-slate-900/60 text-[10px] text-slate-100"
              >
                <Building2 className="mr-1 h-3 w-3" />
                {department.department_name}
              </Badge>
            )}

            {!appliesToCurrentWard && (
              <span className="ml-1 text-[11px] text-amber-300">
                This notice applies to other wards.
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* English content */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">
              Notice details (English)
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
              {typedNotice.content}
            </p>
          </section>

          {/* Nepali content */}
          {typedNotice.content_nepali && (
            <section className="space-y-2 border-t border-slate-800 pt-4">
              <h2 className="text-sm font-semibold text-slate-100">
                सूचनाको विवरण (नेपालीमा)
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                {typedNotice.content_nepali}
              </p>
            </section>
          )}

          {/* Tags */}
          {typedNotice.tags && typedNotice.tags.length > 0 && (
            <section className="space-y-2 border-t border-slate-800 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {typedNotice.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-slate-700 bg-slate-900/60 text-[10px] text-slate-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
