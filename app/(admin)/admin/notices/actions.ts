// app/(admin)/admin/notices/actions.ts
"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import type {
  NoticeStatus,
  NoticeType,
} from "@/components/admin/notices/types";

const NOTICE_NOTIFICATION_TYPE = "notice";
const NOTICE_RELATED_ENTITY_TYPE = "notices";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  if (!value) return false;
  const v = String(value).toLowerCase();
  return v === "true" || v === "on" || v === "1";
}

function parseTags(value: FormDataEntryValue | null): string[] | null {
  if (!value) return null;
  const str = String(value);
  const tags = str
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length ? tags : null;
}

async function getAdminSupabase() {
  const { supabase, profile } = await requireSessionAndProfile(
    "/admin/notices"
  );

  if (!["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Forbidden: admin role required");
  }

  return { supabase, profile };
}

type NoticeForNotification = {
  id: string;
  slug: string;
  title: string;
  content: string;
  related_ward_ids: string[] | null;
};

/**
 * Fan-out notifications when a notice is published.
 * - Citywide: user_id = NULL (broadcast notification, if RLS allows)
 * - Ward-specific: notify all citizens whose ward_id is in related_ward_ids
 */
async function sendNoticeNotifications(
  supabase: SupabaseClient,
  notice: NoticeForNotification
) {
  const shortMessage =
    notice.content.length > 160
      ? `${notice.content.slice(0, 157)}…`
      : notice.content;
  const actionUrl = `/citizen/notices/${notice.slug}`;
  const relatedWardIds = notice.related_ward_ids;

  // Citywide: broadcast notification (user_id = NULL if RLS allows)
  if (!relatedWardIds || relatedWardIds.length === 0) {
    const { error } = await supabase.rpc("notify_user", {
      user_id: null,
      title: notice.title,
      message: shortMessage,
      notification_type: NOTICE_NOTIFICATION_TYPE,
      related_entity_type: NOTICE_RELATED_ENTITY_TYPE,
      related_entity_id: notice.id,
      action_url: actionUrl,
    });

    if (error) {
      console.error("sendNoticeNotifications broadcast error", error);
    }

    return;
  }

  // Ward-specific: fetch all citizens in these wards
  const { data: users, error: usersError } = await supabase
    .from("user_profiles")
    .select("id")
    .in("ward_id", relatedWardIds)
    .eq("role", "citizen");

  if (usersError) {
    console.error(
      "sendNoticeNotifications user_profiles error",
      usersError
    );
    return;
  }

  if (!users || users.length === 0) return;

  await Promise.all(
    users.map(async (u) => {
      const { error } = await supabase.rpc("notify_user", {
        user_id: u.id,
        title: notice.title,
        message: shortMessage,
        notification_type: NOTICE_NOTIFICATION_TYPE,
        related_entity_type: NOTICE_RELATED_ENTITY_TYPE,
        related_entity_id: notice.id,
        action_url: actionUrl,
      });

      if (error) {
        console.error("notify_user (ward) error", error, { userId: u.id });
      }
    })
  );
}

// ---------------------------------------------------------------------------
// CREATE notice
// ---------------------------------------------------------------------------

export async function createNoticeAction(formData: FormData) {
  const { supabase, profile } = await getAdminSupabase();

  const title = String(formData.get("title") || "").trim();
  const title_nepali =
    (formData.get("title_nepali") as string | null) || null;
  const content = String(formData.get("content") || "").trim();
  const content_nepali =
    (formData.get("content_nepali") as string | null) || null;

  const notice_type = (formData.get("notice_type") as NoticeType) || "general";
  const status = (formData.get("status") as NoticeStatus) || "draft";

  const published_date_raw = (formData.get("published_date") as string) || "";
  const expiry_date_raw = (formData.get("expiry_date") as string) || "";

  const is_featured = parseBoolean(formData.get("is_featured"));
  const is_urgent = parseBoolean(formData.get("is_urgent"));

  const tags = parseTags(formData.get("tags"));

  const related_ward_ids_raw = formData.getAll("related_ward_ids") as string[];
  const related_ward_ids =
    related_ward_ids_raw && related_ward_ids_raw.length
      ? related_ward_ids_raw
      : null;

  const related_department_id =
    ((formData.get("related_department_id") as string) || "").trim() ||
    null;

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  const baseSlug = slugify(title);
  const nowIso = new Date().toISOString();

  const published_date =
    status === "published"
      ? published_date_raw || nowIso
      : published_date_raw || null;
  const expiry_date = expiry_date_raw || null;

  // Check for duplicate slugs
  const { data: existingSlug } = await supabase
    .from("notices")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();

  const finalSlug = existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug;

  const { data, error } = await supabase
    .from("notices")
    .insert({
      title,
      title_nepali,
      content,
      content_nepali,
      notice_type,
      status,
      published_date,
      expiry_date,
      is_featured,
      is_urgent,
      tags,
      related_ward_ids,
      related_department_id,
      slug: finalSlug,
      meta_description: content.slice(0, 160),
      created_by: profile.id,
      updated_by: profile.id,
      published_by: status === "published" ? profile.id : null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createNoticeAction error", error);
    throw new Error("Failed to create notice");
  }

  // Fan-out notifications only if created as published
  if (status === "published") {
    try {
      await sendNoticeNotifications(supabase, {
        id: data.id,
        slug: finalSlug,
        title,
        content,
        related_ward_ids,
      });
    } catch (notifyError) {
      console.error("createNoticeAction notify error", notifyError);
    }
  }

  redirect("/admin/notices");
}

// ---------------------------------------------------------------------------
// DELETE notice
// ---------------------------------------------------------------------------

export async function deleteNoticeAction(formData: FormData) {
  const { supabase } = await getAdminSupabase();

  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Notice ID is missing");

  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) {
    console.error("deleteNoticeAction error", error);
    throw new Error("Failed to delete notice");
  }

  redirect("/admin/notices");
}

// ---------------------------------------------------------------------------
// UPDATE notice
// ---------------------------------------------------------------------------

export async function updateNoticeAction(formData: FormData) {
  const { supabase, profile } = await getAdminSupabase();

  const id = (formData.get("id") as string) || "";
  if (!id) throw new Error("Notice id is required");

  // Load existing status/slug to detect new publish
  const { data: existing, error: existingError } = await supabase
    .from("notices")
    .select("status, slug, related_ward_ids")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    console.error("updateNoticeAction existing error", existingError);
    throw new Error("Notice not found");
  }

  const wasPublished = existing.status === "published";

  const title = String(formData.get("title") || "").trim();
  const title_nepali =
    (formData.get("title_nepali") as string | null) || null;
  const content = String(formData.get("content") || "").trim();
  const content_nepali =
    (formData.get("content_nepali") as string | null) || null;

  const notice_type = (formData.get("notice_type") as NoticeType) || "general";
  const status = (formData.get("status") as NoticeStatus) || "draft";

  const published_date_raw = (formData.get("published_date") as string) || "";
  const expiry_date_raw = (formData.get("expiry_date") as string) || "";

  const is_featured = parseBoolean(formData.get("is_featured"));
  const is_urgent = parseBoolean(formData.get("is_urgent"));

  const tags = parseTags(formData.get("tags"));

  const related_ward_ids_raw = formData.getAll("related_ward_ids") as string[];
  const related_ward_ids =
    related_ward_ids_raw && related_ward_ids_raw.length
      ? related_ward_ids_raw
      : null;

  const related_department_id =
    ((formData.get("related_department_id") as string) || "").trim() ||
    null;

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  const nowIso = new Date().toISOString();
  const published_date =
    status === "published"
      ? published_date_raw || nowIso
      : published_date_raw || null;
  const expiry_date = expiry_date_raw || null;

  const { error } = await supabase
    .from("notices")
    .update({
      title,
      title_nepali,
      content,
      content_nepali,
      notice_type,
      status,
      published_date,
      expiry_date,
      is_featured,
      is_urgent,
      tags,
      related_ward_ids,
      related_department_id,
      meta_description: content.slice(0, 160),
      updated_by: profile.id,
      published_by: status === "published" ? profile.id : null,
    })
    .eq("id", id);

  if (error) {
    console.error("updateNoticeAction error", error);
    throw new Error("Failed to update notice");
  }

  // If it was not published before but is published now → send notifications
  if (!wasPublished && status === "published") {
    try {
      await sendNoticeNotifications(supabase, {
        id,
        slug: existing.slug,
        title,
        content,
        related_ward_ids,
      });
    } catch (notifyError) {
      console.error("updateNoticeAction notify error", notifyError);
    }
  }

  redirect("/admin/notices");
}

// ---------------------------------------------------------------------------
// UPDATE status (Publish / Unpublish / Archive) from index
// ---------------------------------------------------------------------------

export async function updateNoticeStatusAction(formData: FormData) {
  const { supabase, profile } = await getAdminSupabase();

  const id = (formData.get("id") as string) || "";
  const nextStatus = formData.get("nextStatus") as NoticeStatus | null;

  if (!id || !nextStatus) {
    throw new Error("Missing id or nextStatus");
  }

  // Load existing notice to detect publish transition
  const { data: existing, error: existingError } = await supabase
    .from("notices")
    .select("status, slug, title, content, related_ward_ids")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    console.error("updateNoticeStatusAction existing error", existingError);
    throw new Error("Notice not found");
  }

  const wasPublished = existing.status === "published";

  const nowIso = new Date().toISOString();

  const payload: Record<string, any> = {
    status: nextStatus,
    updated_by: profile.id,
  };

  if (nextStatus === "published") {
    payload.published_date = nowIso;
    payload.published_by = profile.id;
  } else if (nextStatus === "archived") {
    payload.expiry_date = payload.expiry_date || nowIso;
  }

  const { error } = await supabase
    .from("notices")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("updateNoticeStatusAction error", error);
    throw new Error("Failed to update notice status");
  }

  // If transitioning from non-published → published → notify
  if (!wasPublished && nextStatus === "published") {
    try {
      await sendNoticeNotifications(supabase, {
        id,
        slug: existing.slug,
        title: existing.title,
        content: existing.content,
        related_ward_ids: existing.related_ward_ids ?? null,
      });
    } catch (notifyError) {
      console.error("updateNoticeStatusAction notify error", notifyError);
    }
  }

  redirect("/admin/notices");
}
