import Link from "next/link";
import { UserRole } from "@/lib/auth/roles";

interface CitizenNavProps {
  userRole: UserRole;
}

export function CitizenNav({ userRole }: CitizenNavProps) {
  return (
    <nav className="dashboard-nav">
      <div className="nav-left">
        <div className="logo-pill">P</div>
        <div className="logo-text">
          <span>Smart City</span>
          <span>Pokhara</span>
        </div>
        <div className="nav-links">
          <Link href="/citizen" className="nav-link active">
            Dashboard
          </Link>
          <Link href="/citizen/complaints" className="nav-link">
            My Complaints
          </Link>
          <Link href="/citizen/notices" className="nav-link">
            Notices
          </Link>
        </div>
      </div>
      <div className="nav-right">
        <div className="nav-pill">Citizen</div>
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