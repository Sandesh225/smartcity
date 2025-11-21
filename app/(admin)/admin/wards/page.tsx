// app/(admin)/admin/wards/page.tsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { MapPin, ClipboardList, Users } from 'lucide-react';

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
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore
          }
        },
      },
    }
  );
}

type WardRow = {
  id: string;
  ward_number: number;
  ward_name: string | null;
  office_address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
};

export default async function AdminWardsPage() {
  const supabase = await getSupabaseServer();

  // Fetch wards
  const { data: wards, error: wardsError } = await supabase
    .from('wards')
    .select('id, ward_number, ward_name, office_address, contact_phone, contact_email')
    .order('ward_number');

  if (wardsError) {
    console.error('AdminWardsPage wards error', wardsError);
  }

  const wardRows: WardRow[] = (wards || []) as WardRow[];

  // Fetch open complaints to compute counts per ward
  const { data: complaints } = await supabase
    .from('complaints')
    .select('id, ward_id, status')
    .in('status', ['new', 'in_review', 'in_progress'])
    .limit(2000);

  const openByWard = new Map<string, number>();
  (complaints || []).forEach((c: any) => {
    if (!c.ward_id) return;
    openByWard.set(c.ward_id, (openByWard.get(c.ward_id) || 0) + 1);
  });

  // Staff per ward (approx. count for info)
  const { data: staff } = await supabase
    .from('user_profiles')
    .select('id, ward_id, role')
    .in('role', ['staff', 'admin'])
    .not('ward_id', 'is', null);

  const staffByWard = new Map<string, number>();
  (staff || []).forEach((s: any) => {
    if (!s.ward_id) return;
    staffByWard.set(s.ward_id, (staffByWard.get(s.ward_id) || 0) + 1);
  });

  return (
    <section className="space-y-4">
      <div>
        <h1 className="card-title text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-300" />
          Wards overview
        </h1>
        <p className="card-subtitle text-xs text-slate-400">
          View all wards, their contacts, and open complaint load. Jump directly
          into filtered complaint lists per ward.
        </p>
      </div>

      {wardRows.length === 0 ? (
        <div className="card p-6 text-sm text-slate-400">
          No wards configured yet. Seed your <code>wards</code> table in Supabase.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {wardRows.map((w) => {
            const openCount = openByWard.get(w.id) || 0;
            const staffCount = staffByWard.get(w.id) || 0;

            return (
              <div
                key={w.id}
                className="card border border-slate-800 bg-slate-900/70 hover:border-emerald-500/60 hover:bg-slate-900 transition-colors"
              >
                <div className="card-header">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-950/80 px-2 py-0.5 text-[11px] font-semibold text-slate-200 border border-slate-700/70">
                        Ward {w.ward_number}
                      </span>
                    </div>
                    <h2 className="card-title text-sm mt-1">
                      {w.ward_name || 'Unnamed ward'}
                    </h2>
                    {w.office_address && (
                      <p className="card-subtitle text-[11px] text-slate-400 mt-0.5">
                        {w.office_address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>Assigned staff</span>
                    </div>
                    <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[11px] text-slate-100 border border-slate-700/70">
                      {staffCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-300">
                      <ClipboardList className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Open complaints</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                        openCount === 0
                          ? 'bg-emerald-950/60 text-emerald-200 border-emerald-700/60'
                          : 'bg-amber-950/60 text-amber-200 border-amber-700/60'
                      }`}
                    >
                      {openCount}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-1 text-[11px] text-slate-400">
                    {w.contact_phone && (
                      <div>
                        Phone:{' '}
                        <span className="text-slate-200 font-medium">
                          {w.contact_phone}
                        </span>
                      </div>
                    )}
                    {w.contact_email && (
                      <div>
                        Email:{' '}
                        <span className="text-slate-200 font-medium">
                          {w.contact_email}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={`/admin/complaints?ward=${w.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-500"
                    >
                      View ward complaints
                    </Link>
                    <span className="text-[10px] text-slate-500">
                      Filters admin complaints list by this ward.
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
