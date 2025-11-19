import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { getDefaultPortalPath } from "@/lib/role-redirect";

export default async function HomePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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
            // ignore: middleware handles this
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session -> show landing page
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Smart City Pokhara
          </h1>
          <p className="text-slate-600 mb-8">
            Citizen complaint management system
          </p>
          <div className="space-x-4">
            <Link
              href="/login"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-100"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get role for redirect based on profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role) {
    redirect(getDefaultPortalPath(profile.role as any));
  }

  redirect("/login");
}
