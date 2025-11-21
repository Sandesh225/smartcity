// components/admin/notices/AdminNoticeTypeBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { FileText, Gavel, Users, AlertTriangle, Calendar } from "lucide-react";
import type { NoticeType } from "./types";

interface AdminNoticeTypeBadgeProps {
  type: NoticeType;
  showIcon?: boolean;
}

export function AdminNoticeTypeBadge({
  type,
  showIcon = true,
}: AdminNoticeTypeBadgeProps) {
  const typeConfig: Record<
    NoticeType,
    {
      label: string;
      icon: typeof FileText;
      className: string;
    }
  > = {
    general: {
      label: "General",
      icon: FileText,
      className: "border-slate-700 text-slate-300 bg-slate-900/40",
    },
    tender: {
      label: "Tender",
      icon: Gavel,
      className: "border-blue-700 text-blue-300 bg-blue-950/40",
    },
    public_hearing: {
      label: "Public Hearing",
      icon: Users,
      className: "border-amber-700 text-amber-300 bg-amber-950/40",
    },
    emergency: {
      label: "Emergency",
      icon: AlertTriangle,
      className: "border-red-700 text-red-300 bg-red-950/40",
    },
    event: {
      label: "Event",
      icon: Calendar,
      className: "border-purple-700 text-purple-300 bg-purple-950/40",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
