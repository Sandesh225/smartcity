"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type SystemSettingsState = {
  complaintsPerPage: number;
  notificationsPerPage: number;
  maxAttachmentSizeMb: number;
  loading: boolean;
  error: string | null;
};

export function useSystemSettings(): SystemSettingsState {
  const [state, setState] = useState<SystemSettingsState>({
    complaintsPerPage: 20,
    notificationsPerPage: 20,
    maxAttachmentSizeMb: 50,
    loading: true,
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        const { data, error } = await supabaseBrowser
          .from("system_settings")
          .select("setting_key, setting_value, setting_type")
          .in("setting_key", [
            "complaints_per_page",
            "notifications_per_page",
            "max_attachment_size_mb",
          ]);

        if (error) throw error;

        let complaintsPerPage = state.complaintsPerPage;
        let notificationsPerPage = state.notificationsPerPage;
        let maxAttachmentSizeMb = state.maxAttachmentSizeMb;

        for (const row of data ?? []) {
          const key = row.setting_key;
          const val = row.setting_value;
          if (!val) continue;

          if (key === "complaints_per_page") {
            complaintsPerPage = Number(val) || complaintsPerPage;
          } else if (key === "notifications_per_page") {
            notificationsPerPage = Number(val) || notificationsPerPage;
          } else if (key === "max_attachment_size_mb") {
            maxAttachmentSizeMb = Number(val) || maxAttachmentSizeMb;
          }
        }

        setState({
          complaintsPerPage,
          notificationsPerPage,
          maxAttachmentSizeMb,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err?.message ?? "Failed to load system settings",
        }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
