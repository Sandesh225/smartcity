// components/admin/notices/AdminNoticeCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminNoticeStatusBadge } from "./AdminNoticeStatusBadge";
import { AdminNoticeTypeBadge } from "./AdminNoticeTypeBadge";
import { AdminNoticeFeatureBadges } from "./AdminNoticeFeatureBadges";
import { formatDistanceToNow } from "date-fns";
import type { NoticeRow, NoticeStatus, WardOption, DepartmentOption } from "./types";

interface AdminNoticeCardProps {
  notice: NoticeRow;
  wards: WardOption[];
  departments: DepartmentOption[];
  onStatusChange: (id: string, nextStatus: NoticeStatus) => void;
  onDelete: (id: string) => void;
}

export function AdminNoticeCard({
  notice,
  wards,
  departments,
  onStatusChange,
  onDelete,
}: AdminNoticeCardProps) {
  const router = useRouter();
  const [openDelete, setOpenDelete] = useState(false);

  const relatedWards =
    notice.related_ward_ids?.map((id) =>
      wards.find((w) => String(w.id) === String(id))
    ) || [];

  const hasWardTargets =
    Array.isArray(notice.related_ward_ids) &&
    notice.related_ward_ids.length > 0;

  const relatedDepartment = notice.related_department_id
    ? departments.find(
        (d) => String(d.id) === String(notice.related_department_id)
      )
    : null;

  const nextStatusLabel: { action: string; to: NoticeStatus }[] = (() => {
    if (notice.status === "draft") {
      return [{ action: "Publish", to: "published" }];
    }
    if (notice.status === "published") {
      return [
        { action: "Move to Draft", to: "draft" },
        { action: "Archive", to: "archived" },
      ];
    }
    if (notice.status === "archived") {
      return [{ action: "Move to Draft", to: "draft" }];
    }
    return [];
  })();

  return (
    <>
      <Card className="group border-slate-800 bg-slate-900/60 backdrop-blur transition-all hover:border-slate-700 hover:bg-slate-900/80">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <AdminNoticeTypeBadge type={notice.notice_type} />
                <AdminNoticeStatusBadge status={notice.status} />
                <AdminNoticeFeatureBadges
                  isFeatured={notice.is_featured}
                  isUrgent={notice.is_urgent}
                />
              </div>

              <h3 className="line-clamp-2 text-base font-semibold text-slate-100">
                {notice.title}
              </h3>

              {notice.title_nepali && (
                <p className="line-clamp-1 text-sm text-slate-400">
                  {notice.title_nepali}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-slate-800 bg-slate-900"
              >
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/notices/${notice.slug ?? notice.id}`)
                  }
                  className="text-slate-200"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View (Citizen)
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/notices/${notice.id}/edit`)
                  }
                  className="text-slate-200"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                {nextStatusLabel.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    {nextStatusLabel.map((item) => (
                      <DropdownMenuItem
                        key={item.action}
                        onClick={() =>
                          onStatusChange(notice.id, item.to as NoticeStatus)
                        }
                        className="text-slate-200"
                      >
                        {item.action}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  className="text-red-400 focus:bg-red-950/40"
                  onClick={() => setOpenDelete(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-slate-400">
            {notice.content}
          </p>

          {Array.isArray(notice.tags) && notice.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {notice.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-slate-700 bg-slate-950/50 text-[10px] text-slate-400"
                >
                  {tag}
                </Badge>
              ))}
              {notice.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="border-slate-700 bg-slate-950/50 text-[10px] text-slate-400"
                >
                  +{notice.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {notice.published_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(notice.published_date), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {hasWardTargets ? (
                <span>
                  {relatedWards.length === 1 && relatedWards[0]
                    ? `Ward ${relatedWards[0].ward_number}`
                    : `${relatedWards.filter(Boolean).length} wards`}
                </span>
              ) : (
                <span>All wards</span>
              )}
            </div>

            {relatedDepartment && (
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span className="truncate">
                  {relatedDepartment.department_name}
                </span>
              </div>
            )}

            {notice.view_count > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{notice.view_count} views</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">
              Delete this notice?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the
              notice and remove it from the citizen portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-slate-50 hover:bg-red-500"
              onClick={() => onDelete(notice.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
