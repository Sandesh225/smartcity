// components/admin/notices/AdminNoticeStatusBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import type { NoticeStatus } from "./types";

interface AdminNoticeStatusBadgeProps {
  status: NoticeStatus;
  showIcon?: boolean;
}

export function AdminNoticeStatusBadge({
  status,
  showIcon = true,
}: AdminNoticeStatusBadgeProps) {
  const statusConfig: Record<
    NoticeStatus,
    {
      label: string;
      variant: "default" | "secondary" | "outline" | "destructive";
      className: string;
    }
  > = {
    published: {
      label: "Published",
      variant: "default",
      className: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
    },
    draft: {
      label: "Draft",
      variant: "secondary",
      className: "bg-amber-900/50 text-amber-300 border-amber-700/50",
    },
    archived: {
      label: "Archived",
      variant: "outline",
      className: "bg-slate-800/50 text-slate-400 border-slate-700",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Circle className="mr-1 h-2 w-2 fill-current" />}
      {config.label}
    </Badge>
  );
}
