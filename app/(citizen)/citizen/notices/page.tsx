// app/(citizen)/citizen/notices/page.tsx
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import { CitizenNoticesClient } from "@/components/citizen/notices/CitizenNoticesClient";

export const dynamic = "force-dynamic";

export type CitizenNoticeRow = {
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

export default async function CitizenNoticesPage() {
  const { supabase, profile } = await requireSessionAndProfile(
    "/citizen/notices"
  );

  // ✅ FETCH ALL NOTICES without ward filtering
  const { data: noticesData, error } = await supabase
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
    .eq("status", "published")
    .or("expiry_date.is.null,expiry_date.gt.now()")
    .order("published_date", { ascending: false })
    .limit(100);

  if (error) {
    console.error("CitizenNoticesPage notices error", error);
  }

  const notices = (noticesData || []) as CitizenNoticeRow[];

  const { data: wardsData, error: wardsError } = await supabase
    .from("wards")
    .select("id, ward_number, ward_name")
    .eq("is_active", true)
    .order("ward_number");

  if (wardsError) {
    console.error("CitizenNoticesPage wards error", wardsError);
  }

  const wards = (wardsData || []) as WardRow[];

  return (
    <main className="space-y-8 px-4 py-6 md:px-6 md:py-8 lg:space-y-10">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          City Notices &amp; Announcements
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Stay informed about tenders, public hearings, emergency alerts, and
          city events. All published notices are visible to all citizens.
        </p>
      </section>

      {/* ✅ REMOVED userWardId prop */}
      <CitizenNoticesClient
        initialNotices={notices}
        wards={wards}
      />
    </main>
  );
}