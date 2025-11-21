// app/(admin)/admin/cms/faqs/actions.ts
"use server";

import { redirect } from "next/navigation";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import type { FaqStatus } from "@/components/admin/faqs/types";

async function getAdminSupabase() {
  const { supabase, profile } = await requireSessionAndProfile(
    "/admin/cms/faqs"
  );
  if (!["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Forbidden");
  }
  return { supabase, profile };
}

export async function createFaqAction(formData: FormData) {
  const { supabase, profile } = await getAdminSupabase();

  const question = String(formData.get("question") || "").trim();
  const question_nepali =
    ((formData.get("question_nepali") as string | null) || "").trim() || null;
  const answer = String(formData.get("answer") || "").trim();
  const answer_nepali =
    ((formData.get("answer_nepali") as string | null) || "").trim() || null;
  const category =
    ((formData.get("category") as string | null) || "").trim() || null;
  const tagsRaw = (formData.get("tags") as string) || "";
  const status = (formData.get("status") as FaqStatus) || "draft";

  if (!question || !answer) throw new Error("Question and answer required");

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : null;

  const { error } = await supabase.from("faqs").insert({
    question,
    question_nepali,
    answer,
    answer_nepali,
    category,
    tags,
    status,
    created_by: profile.id,
    updated_by: profile.id,
  });

  if (error) {
    console.error("createFaqAction error:", error);
    throw new Error("Failed to create FAQ");
  }

  redirect("/admin/cms/faqs");
}

export async function updateFaqAction(formData: FormData) {
  const { supabase, profile } = await getAdminSupabase();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("FAQ id is required");

  const question = String(formData.get("question") || "").trim();
  const question_nepali =
    ((formData.get("question_nepali") as string | null) || "").trim() || null;
  const answer = String(formData.get("answer") || "").trim();
  const answer_nepali =
    ((formData.get("answer_nepali") as string | null) || "").trim() || null;
  const category =
    ((formData.get("category") as string | null) || "").trim() || null;
  const tagsRaw = (formData.get("tags") as string) || "";
  const status = (formData.get("status") as FaqStatus) || "draft";

  if (!question || !answer) throw new Error("Question and answer required");

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : null;

  const { error } = await supabase
    .from("faqs")
    .update({
      question,
      question_nepali,
      answer,
      answer_nepali,
      category,
      tags,
      status,
      updated_by: profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("updateFaqAction error:", error);
    throw new Error("Failed to update FAQ");
  }

  redirect("/admin/cms/faqs");
}

export async function deleteFaqAction(formData: FormData) {
  const { supabase } = await getAdminSupabase();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("FAQ id is required");

  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) {
    console.error("deleteFaqAction error:", error);
    throw new Error("Failed to delete FAQ");
  }

  redirect("/admin/cms/faqs");
}
