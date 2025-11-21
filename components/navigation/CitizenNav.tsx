

// FILE: components/navigation/CitizenNav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Bell, User, Menu, X, LogOut, PlusCircle } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';

type CitizenNavProps = {
  profile: {
    full_name: string;
    email: string;
  };
  unreadNotifications: number;
};

export function CitizenNav({ profile, unreadNotifications }: CitizenNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/citizen/dashboard", label: "Dashboard", icon: Home },
    { href: "/citizen/complaints", label: "My Complaints", icon: FileText },
    {
      href: "/citizen/complaints/new",
      label: "New Complaint",
      icon: PlusCircle,
    },
    {
      href: "/citizen/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications,
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <header className="dashboard-nav">
        <div className="nav-left">
          <div className="logo-pill">SC</div>
          <div className="logo-text">
            <span>Smart City Pokhara</span>
            <span>Citizen Panel</span>
          </div>

          {/* Desktop Links */}
          <nav className="nav-links">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon className="w-4 h-4 inline mr-1.5" />
                  {link.label}
                  {link.badge && link.badge > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                      {link.badge > 9 ? "9+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="nav-right">
          {/* Profile */}
          <div className="nav-profile">
            <div className="nav-avatar">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="nav-profile-text">
              <span>Citizen</span>
              <span>{profile.full_name}</span>
            </div>
          </div>

          {/* Logout */}
          <LogoutButton />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl">
          <div className="flex flex-col h-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="logo-pill">SC</div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">
                    Smart City
                  </div>
                  <div className="text-sm font-semibold text-slate-100">
                    Pokhara
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="card p-4 mb-6 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-lg">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    {profile.full_name}
                  </div>
                  <div className="text-xs text-slate-400">{profile.email}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Citizen Account
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? "bg-emerald-950/50 border border-emerald-800/50 text-emerald-300"
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 font-medium">{link.label}</span>
                    {link.badge && link.badge > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                        {link.badge > 9 ? "9+" : link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="pt-6 border-t border-slate-800">
              <LogoutButton className="w-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}