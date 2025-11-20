"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Master Data", href: "/admin/master-data" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Hospitals", href: "/admin/hospitals" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
          Enterprise Administration
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Hospital Command Center</h1>
            <p className="text-sm text-muted-foreground">
              Configure users, master data, billing policies, and campus operations for the Medstar network.
            </p>
          </div>
          <button className="rounded-lg border border-primary/40 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5">
            Invite administrator
          </button>
        </div>
        <nav className="flex flex-wrap gap-2 pt-2">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
