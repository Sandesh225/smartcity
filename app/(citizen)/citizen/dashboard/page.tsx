// app/(citizen)/citizen/dashboard/page.tsx
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import Hero from "@/components/citizen/dashboard/Hero";
import StatsOverview from "@/components/citizen/dashboard/StatsOverview";
import RecentComplaints from "@/components/citizen/dashboard/RecentComplaints";
import EmptyDashboard from "@/components/citizen/dashboard/EmptyDashboard";
import ErrorBanner from "@/components/citizen/dashboard/ErrorBanner";
import { CitizenDashboardNotices } from "@/components/citizen/notices/CitizenDashboardNotices";

export const dynamic = "force-dynamic";

export type ComplaintSummary = {
  id: string;
  tracking_id: string;
  title: string;
  status: "new" | "in_progress" | "resolved" | "closed" | "rejected" | string;
  priority: "low" | "medium" | "high" | "critical" | string;
  created_at: string;
  category_id: string | null;
};

export type ComplaintStats = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
  lastActivityAt: string | null;
  mostRecent: ComplaintSummary | null;
};

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

function computeStats(complaints: ComplaintSummary[]): ComplaintStats {
  const total = complaints.length;
  const open = complaints.filter((c) =>
    ["new", "in_progress"].includes(c.status)
  ).length;
  const inProgress = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const mostRecent = complaints[0] ?? null;
  const lastActivityAt = mostRecent ? mostRecent.created_at : null;

  return {
    total,
    open,
    inProgress,
    resolved,
    resolutionRate,
    lastActivityAt,
    mostRecent,
  };
}

export default async function CitizenDashboardPage() {
  const { profile, supabase } = await requireSessionAndProfile(
    "/citizen/dashboard"
  );

  const fullName = profile.full_name ?? "Citizen";
  const firstName = fullName.split(" ")[0];

  // Fetch complaints and notices in parallel
  const [complaintsResult, noticesResult] = await Promise.all([
    supabase
      .from("complaints")
      .select(
        "id, tracking_id, title, status, priority, created_at, category_id"
      )
      .eq("citizen_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(12),
    // ✅ FIXED: Fetch ALL published notices without any filtering
    supabase
      .from("notices")
      .select(
        "id, title, title_nepali, content, slug, is_urgent, is_featured, published_date, related_ward_ids, notice_type"
      )
      .eq("status", "published")
      .or("expiry_date.is.null,expiry_date.gt.now()")
      .order("published_date", { ascending: false })
      .limit(10),
  ]);

  // Handle complaints error
  if (complaintsResult.error) {
    return (
      <main className="px-4 py-6 md:px-6 md:py-8">
        <ErrorBanner message="We couldn't load your dashboard right now. Please try again in a moment." />
      </main>
    );
  }

  // Handle notices error gracefully
  if (noticesResult.error) {
    console.error("Dashboard notices fetch error:", noticesResult.error);
  }

  const complaints = (complaintsResult.data ?? []) as ComplaintSummary[];
  const notices = (noticesResult.data ?? []) as NoticeRow[];
  const stats = computeStats(complaints);
  const isEmpty = complaints.length === 0;

  // Debug: Check what notices we're getting
  console.log("Dashboard notices count:", notices.length);
  console.log("Dashboard notices:", notices);

  return (
    <main className="space-y-8 px-4 py-6 md:px-6 md:py-8 lg:space-y-10">
      {/* Hero Panel */}
      <Hero firstName={firstName} stats={stats} />

      {/* Dashboard Body */}
      {isEmpty ? (
        // No complaints yet → Empty state + Notices side by side
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
          <EmptyDashboard />
          <CitizenDashboardNotices initialNotices={notices} />
        </section>
      ) : (
        // User has complaints → Stats + Notices + Recent Complaints
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] xl:gap-8">
          <div className="space-y-6">
            <StatsOverview stats={stats} />
            <CitizenDashboardNotices initialNotices={notices} />
          </div>
          <RecentComplaints complaints={complaints} />
        </section>
      )}
    </main>
  );
}
