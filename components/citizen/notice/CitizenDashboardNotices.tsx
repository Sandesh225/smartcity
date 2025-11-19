// components/citizen/notices/CitizenDashboardNotices.tsx
import Link from "next/link";
import { AlertTriangle, Star, ChevronRight, Bell } from "lucide-react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

type NoticeRow = {
  id: string;
  title: string;
  title_nepali: string | null;
  content: string;
  slug: string;
  is_urgent: boolean;
  is_featured: boolean;
  published_date: string | null;
};

export async function CitizenDashboardNotices() {
  const supabase = await getSupabaseServer();

  // 1 urgent (most recent)
  const { data: urgentNotice } = await supabase
    .from("notices")
    .select(
      "id, title, title_nepali, content, slug, is_urgent, published_date"
    )
    .eq("status", "published")
    .eq("is_urgent", true)
    .or("expiry_date.is.null,expiry_date.gt.now()")
    .order("published_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Up to 3 featured
  const { data: featuredNotices } = await supabase
    .from("notices")
    .select(
      "id, title, title_nepali, content, slug, is_featured, published_date"
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .or("expiry_date.is.null,expiry_date.gt.now()")
    .order("published_date", { ascending: false })
    .limit(3);

  return (
    <section className="rounded-2xl border border-glass-soft bg-surface-elevated/80 px-5 py-4 shadow-glass-md backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-50">
            City notices
          </h2>
        </div>
        <Link
          href="/citizen/notices"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Urgent */}
      {urgentNotice && (
        <Link
          href={`/citizen/notices/${urgentNotice.slug}`}
          className="block rounded-xl border border-red-700/70 bg-red-950/40 px-4 py-3 hover:bg-red-950/60 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-900/70 px-2 py-0.5 text-[10px] font-semibold text-red-100">
                  URGENT
                </span>
                {urgentNotice.published_date && (
                  <span className="text-[10px] text-red-300/80">
                    {new Date(
                      urgentNotice.published_date
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h3 className="mb-0.5 line-clamp-1 text-sm font-semibold text-red-50">
                {urgentNotice.title}
              </h3>
              {urgentNotice.title_nepali && (
                <p className="mb-1 line-clamp-1 text-[11px] text-red-100/90">
                  {urgentNotice.title_nepali}
                </p>
              )}
              <p className="line-clamp-2 text-[11px] text-red-100/80">
                {urgentNotice.content}
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Featured */}
      {featuredNotices && featuredNotices.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Star className="h-3.5 w-3.5 text-emerald-400" />
            Featured notices
          </h3>
          {featuredNotices.map((notice: NoticeRow) => (
            <Link
              key={notice.id}
              href={`/citizen/notices/${notice.slug}`}
              className="block rounded-xl border border-slate-800 bg-surface-deep/80 px-3 py-2.5 hover:border-slate-600 hover:bg-surface-deep transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="mb-0.5 truncate text-xs font-semibold text-slate-100">
                    {notice.title}
                  </h4>
                  {notice.title_nepali && (
                    <p className="truncate text-[11px] text-slate-400">
                      {notice.title_nepali}
                    </p>
                  )}
                  <p className="line-clamp-1 text-[11px] text-slate-500">
                    {notice.content}
                  </p>
                </div>
                {notice.published_date && (
                  <span className="flex-shrink-0 text-[10px] text-slate-500">
                    {new Date(
                      notice.published_date
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!urgentNotice && (!featuredNotices || featuredNotices.length === 0) && (
        <div className="py-5 text-center text-xs text-slate-500">
          No active notices right now.
        </div>
      )}
    </section>
  );
}
