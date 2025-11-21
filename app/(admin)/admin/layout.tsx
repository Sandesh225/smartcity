// app/(admin)/admin/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
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
            // ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?next=/admin");
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, full_name, role, email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Admin layout profile error:", profileError);
    redirect("/login");
  }

  // Check if user has admin role
  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 text-sm font-bold text-white">
                SC
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Smart City Pokhara
                </h1>
                <p className="text-sm text-slate-400">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                {profile.role}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <EmailVerificationBanner />
        {children}
      </main>
    </div>
  );
}