// lib/hooks/useSmartBack.ts
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useSmartBack(fallbackHref: string) {
  const router = useRouter();

  return useCallback(() => {
    if (typeof window === "undefined") {
      router.push(fallbackHref);
      return;
    }

    const ref = document.referrer;
    const fromNotices =
      typeof ref === "string" && ref.includes("/admin/notices");

    if (fromNotices && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }, [router, fallbackHref]);
}
