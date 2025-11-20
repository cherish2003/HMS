"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CreditCard,
  FlaskConical,
  Hospital,
  LayoutDashboard,
  Pill,
  Settings2,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROLE_LABELS,
  demoHospitals,
  useAuthStore,
  type UserRole,
} from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { ThemeSwitcher } from "./theme-switcher";

const BRAND_NAME = "MEDSTAR HOSPITALS";

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { name: "Network Pulse", href: "/dashboard", icon: LayoutDashboard },
    { name: "Hospitals", href: "/admin/hospitals", icon: Hospital },
    { name: "Admin Console", href: "/admin", icon: Settings2 },
    { name: "Revenue", href: "/billing", icon: CreditCard },
    { name: "AI Assistant", href: "/ai", icon: Stethoscope },
  ],
  HOSPITAL_ADMIN: [
    { name: "Hospital Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: UserRound },
    { name: "Appointments", href: "/appointments", icon: CalendarDays },
    { name: "Bed Board", href: "/beds", icon: Hospital },
    { name: "Administration", href: "/admin", icon: Settings2 },
  ],
  DOCTOR: [
    { name: "Doctor Cockpit", href: "/dashboard/doctor", icon: Stethoscope },
    { name: "Appointments", href: "/appointments", icon: CalendarDays },
    { name: "Patients", href: "/patients", icon: UserRound },
    { name: "Lab & Orders", href: "/lab", icon: FlaskConical },
    { name: "AI Rounds", href: "/ai", icon: Activity },
  ],
  NURSE: [
    { name: "Ward Overview", href: "/dashboard/nurse", icon: LayoutDashboard },
    { name: "Bed Board", href: "/beds", icon: Hospital },
    { name: "Patients", href: "/patients", icon: UserRound },
    { name: "Medications", href: "/pharmacy", icon: Activity },
  ],
  FINANCE: [
    { name: "Billing Cockpit", href: "/billing", icon: CreditCard },
    { name: "Patients", href: "/patients", icon: UserRound },
    { name: "AI Assistant", href: "/ai", icon: Stethoscope },
  ],
  LAB: [
    { name: "Lab Queue", href: "/lab", icon: FlaskConical },
    { name: "Patients", href: "/patients", icon: UserRound },
  ],
  PHARMACY: [
    { name: "Pharmacy Cockpit", href: "/pharmacy", icon: Pill },
    { name: "Patients", href: "/patients", icon: UserRound },
    { name: "Billing", href: "/billing", icon: CreditCard },
  ],
  FRONT_DESK: [
    { name: "Front Desk", href: "/appointments", icon: CalendarDays },
    { name: "Patients", href: "/patients", icon: UserRound },
    { name: "Billing", href: "/billing", icon: CreditCard },
  ],
  PATIENT: [
    { name: "My Health", href: "/dashboard/patient", icon: LayoutDashboard },
    { name: "Appointments", href: "/appointments", icon: CalendarDays },
    { name: "Invoices", href: "/billing", icon: CreditCard },
  ],
};

type QuickAction = {
  label: string;
  href: string;
};

const ROLE_QUICK_ACTIONS: Record<UserRole, QuickAction[]> = {
  SUPER_ADMIN: [
    { label: "Invite Admin", href: "#" },
    { label: "View Audit Trail", href: "#" },
  ],
  HOSPITAL_ADMIN: [
    { label: "Admit Patient", href: "#" },
    { label: "Book Appointment", href: "#" },
  ],
  DOCTOR: [
    { label: "Start Encounter", href: "#" },
    { label: "Write Prescription", href: "#" },
  ],
  NURSE: [
    { label: "Update Vitals", href: "#" },
    { label: "Schedule Medication", href: "#" },
  ],
  FINANCE: [
    { label: "Record Payment", href: "#" },
    { label: "Export Aging", href: "#" },
  ],
  LAB: [
    { label: "Collect Sample", href: "#" },
    { label: "Verify Result", href: "#" },
  ],
  PHARMACY: [
    { label: "Dispense prescription", href: "#" },
    { label: "Adjust stock", href: "#" },
  ],
  FRONT_DESK: [
    { label: "Register Patient", href: "#" },
    { label: "Collect Co-pay", href: "#" },
  ],
  PATIENT: [
    { label: "Book Visit", href: "#" },
    { label: "Download Invoice", href: "#" },
  ],
};

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, selectedHospital, switchHospital, logout } = useAuthStore();
  const [hospitalMenuOpen, setHospitalMenuOpen] = useState(false);
  const activeRoleLabel = ROLE_LABELS[user?.role ?? "SUPER_ADMIN"] ?? "Super Admin";
  const role = user?.role ?? "SUPER_ADMIN";

  const navItems = useMemo(() => {
    return ROLE_NAV_ITEMS[role] ?? ROLE_NAV_ITEMS.SUPER_ADMIN;
  }, [role]);

  const quickActions = useMemo(() => {
    return ROLE_QUICK_ACTIONS[role] ?? ROLE_QUICK_ACTIONS.SUPER_ADMIN;
  }, [role]);

  const allowedPrefixes = useMemo(() => navItems.map((item) => item.href).filter((href) => href !== "#"), [navItems]);

  useEffect(() => {
    if (!pathname || !navItems.length) return;

    const isAllowed = allowedPrefixes.some((prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!isAllowed && navItems[0]?.href) {
      router.replace(navItems[0].href);
    }
  }, [allowedPrefixes, navItems, pathname, router]);

  useEffect(() => {
    useThemeStore.getState().initialize();
  }, []);

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))] text-sm text-muted-foreground">
      <aside className="flex w-64 flex-col border-r border-border bg-[hsl(var(--surface-panel))] px-4 py-6 shadow-[0_24px_40px_-28px_hsl(var(--shadow-soft))]">
        <div className="flex items-center gap-3 px-2">
          <div>
            <p className="text-base font-semibold text-foreground">
              {BRAND_NAME}
            </p>
            <p className="text-xs text-muted-foreground">
              Unified Care Network
            </p>
          </div>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setHospitalMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/45",
                  isActive
                    ? "border-primary/25 bg-[hsl(var(--surface-strong))] text-foreground shadow-[0_18px_34px_-26px_hsl(var(--shadow-soft))]"
                    : "text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 rounded-xl bg-[hsl(var(--surface-interactive))] p-3 text-xs text-muted-foreground shadow-[0_18px_34px_-28px_hsl(var(--shadow-soft))]">
          <p className="font-semibold text-foreground">Quick Actions</p>
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="block rounded-lg px-2 py-2 text-xs transition-colors hover:bg-[hsl(var(--surface-strong))] hover:text-foreground"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-[hsl(var(--surface-panel))]/90 backdrop-blur">
          <div className="flex items-center gap-4 px-8 py-4">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-border/70 bg-[hsl(var(--surface-panel))] px-4 py-2 transition-all focus-within:border-primary/40 focus-within:shadow-[0_14px_30px_-24px_hsl(var(--shadow-soft))]">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search patients, doctors, visits..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <div className="relative">
                <QuickActionPill
                  as="button"
                  onClick={() => setHospitalMenuOpen((prev) => !prev)}
                  label={
                    <span className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">
                        {selectedHospital.name}
                      </span>
                    </span>
                  }
                />
                {hospitalMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-[hsl(var(--surface-panel))] p-2 shadow-[0_18px_42px_-28px_hsl(var(--shadow-soft))]">
                    <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Switch Hospital
                    </p>
                    <ul className="space-y-1">
                      {demoHospitals.map((hospital) => (
                        <li key={hospital.id}>
                          <button
                            type="button"
                            onClick={() => {
                              switchHospital(hospital.id);
                              setHospitalMenuOpen(false);
                            }}
                            className={cn(
                              "w-full rounded-lg px-3 py-2 text-left text-xs transition-colors",
                              hospital.id === selectedHospital.id
                                ? "bg-[hsl(var(--surface-strong))] text-foreground"
                                : "text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                            )}
                          >
                            <span className="block font-medium text-foreground">
                              {hospital.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {hospital.location}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <QuickActionPill label="Notifications" variant="secondary" />
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
              >
                {user?.initials ?? "--"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <div className="mb-4 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {selectedHospital.location} • {activeRoleLabel}
          </div>
          {children}
        </main>
      </section>
    </div>
  );
}

type QuickActionPillProps = {
  label: ReactNode;
  as?: "button" | "div";
  variant?: "primary" | "secondary";
  onClick?: () => void;
};

function QuickActionPill({
  label,
  variant = "primary",
  as = "button",
  onClick,
}: QuickActionPillProps) {
  return (
    <ComponentWrapper
      as={as}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/45",
        variant === "primary"
          ? "border-transparent bg-[hsl(var(--surface-interactive))] text-foreground hover:bg-[hsl(var(--surface-strong))]"
          : "border-border/60 bg-[hsl(var(--surface-panel))] text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
      )}
    >
      {label}
    </ComponentWrapper>
  );
}

type ComponentWrapperProps = {
  as: "button" | "div";
  className: string;
  onClick?: () => void;
  children: ReactNode;
};

function ComponentWrapper({ as, className, onClick, children }: ComponentWrapperProps) {
  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <div className={className} onClick={onClick} role="presentation">
      {children}
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M15.5 15.5L20 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="11"
        cy="11"
        r="6.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
