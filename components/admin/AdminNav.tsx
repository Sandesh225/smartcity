// components/admin/AdminNav.tsx
import Link from "next/link";
import type { UserRole } from "@/lib/auth/roles";

interface AdminNavProps {
  userRole: UserRole;
  currentPath?: string;
}

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/complaints", label: "Complaints" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/cms/notices", label: "CMS" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/notifications", label: "Notifications" },
];

export function AdminNav({ userRole }: AdminNavProps) {
  const isSuper = userRole === "super_admin";

  return (
    <nav className="dashboard-nav">
      <div className="nav-left">
        <div className="logo-pill">P</div>
        <div className="logo-text">
          <span>Smart City</span>
          <span>Pokhara Admin</span>
        </div>
        <div className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="nav-right">
        <div className="nav-pill">
          {isSuper ? "Super Admin" : "Administrator"}
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="nav-pill hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </form>
      </div>
    </nav>
  );
}
