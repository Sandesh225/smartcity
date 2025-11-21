// app/auth/signout/route.ts
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
