// components/admin/notices/AdminNoticeFeatureBadges.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Star, Bell } from "lucide-react";

interface AdminNoticeFeatureBadgesProps {
  isFeatured?: boolean;
  isUrgent?: boolean;
}

export function AdminNoticeFeatureBadges({
  isFeatured,
  isUrgent,
}: AdminNoticeFeatureBadgesProps) {
  if (!isFeatured && !isUrgent) return null;

  return (
    <div className="flex items-center gap-2">
      {isFeatured && (
        <Badge
          variant="outline"
          className="border-emerald-700 bg-emerald-950/40 text-emerald-300"
        >
          <Star className="mr-1 h-3 w-3 fill-current" />
          Featured
        </Badge>
      )}
      {isUrgent && (
        <Badge
          variant="outline"
          className="border-red-700 bg-red-950/40 text-red-300"
        >
          <Bell className="mr-1 h-3 w-3" />
          Urgent
        </Badge>
      )}
    </div>
  );
}
