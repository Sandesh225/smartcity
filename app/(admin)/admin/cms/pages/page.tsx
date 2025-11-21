// app/(admin)/admin/cms/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import { FileText, HelpCircle, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  const { profile } = await requireSessionAndProfile("/admin/cms");

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  const cards = [
    {
      href: "/admin/notices",
      title: "Notices",
      description: "Publish tenders, public hearings, emergencies and updates.",
      icon: <Newspaper className="h-5 w-5 text-emerald-400" />,
    },
    {
      href: "/admin/cms/pages",
      title: "Static Pages",
      description: "Manage About, Services, Guidelines and other CMS pages.",
      icon: <FileText className="h-5 w-5 text-emerald-400" />,
    },
    {
      href: "/admin/cms/faqs",
      title: "FAQs",
      description: "Frequently asked questions for citizens.",
      icon: <HelpCircle className="h-5 w-5 text-emerald-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">CMS Management</h1>
        <p className="text-sm text-slate-400">
          Manage notices, pages and FAQs shown in the citizen portal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-emerald-500/60 hover:bg-slate-900/80"
          >
            <div className="mb-3 inline-flex rounded-full bg-emerald-500/10 p-2">
              {card.icon}
            </div>
            <h2 className="text-sm font-semibold text-slate-100">
              {card.title}
            </h2>
            <p className="mt-1 text-xs text-slate-400">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
