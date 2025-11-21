// components/admin/notices/AdminNoticeEmptyState.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";

export function AdminNoticeEmptyState() {
  return (
    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 rounded-full bg-slate-800/50 p-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-200">
          No notices yet
        </h3>
        <p className="mb-6 max-w-sm text-center text-sm text-slate-400">
          Get started by creating your first notice. Keep citizens informed
          about important updates and announcements.
        </p>
        <Link href="/admin/notices/new">
          <Button className="bg-emerald-600 text-slate-950 hover:bg-emerald-500">
            <Plus className="mr-2 h-4 w-4" />
            Create First Notice
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
