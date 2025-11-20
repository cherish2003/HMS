"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ROLE_LABELS,
  demoHospitals,
  demoUsers,
getDefaultRouteByRole,
  type DemoUser,
  type UserRole,
  useAuthStore,
} from "@/store/auth-store";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [selectedRole, setSelectedRole] = useState<UserRole>("SUPER_ADMIN");
  const [selectedHospital, setSelectedHospital] = useState(demoHospitals[0].id);
  const [selectedUserId, setSelectedUserId] = useState(() =>
    demoUsers.find((user) => user.role === "SUPER_ADMIN")?.id ?? demoUsers[0].id
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleSpecificUsers = useMemo(
    () => demoUsers.filter((user) => user.role === selectedRole),
    [selectedRole]
  );

  const heroCopyByRole: Record<UserRole, { headline: string; subline: string }> = {
    SUPER_ADMIN: {
      headline: "Command the Medstar network with surgical precision",
      subline:
        "Monitor group-wide performance, compliance, and AI insights designed for enterprise healthcare operators.",
    },
    HOSPITAL_ADMIN: {
      headline: "Hospital operations in a single, stunning control center",
      subline:
        "Staffing, OT schedules, bed utilization, and revenue levers presented in a modern CRM-style experience.",
    },
    DOCTOR: {
      headline: "Clinic-ready workspace for specialists",
      subline:
        "Appointments, inpatient panels, and AI-assisted note drafting curated for Medstar clinicians.",
    },
    NURSE: {
      headline: "Stay ahead of ward priorities",
      subline:
        "Bed boards, vitals capture, medication rounds—streamlined for nursing super-users.",
    },
    FINANCE: {
      headline: "Revenue cycle clarity",
      subline:
        "Charge capture, claims, and payment orchestration with enterprise-grade audit readiness.",
    },
    LAB: {
      headline: "High-velocity diagnostics",
      subline:
        "Manage orders, sample status, and reporting pipelines across lab and radiology floors.",
    },
    PHARMACY: {
      headline: "Dispensing perfected for floor coordination",
      subline:
        "Queue-driven prescriptions, inventory health, and counseling drafts tailored for clinical pharmacists.",
    },
    FRONT_DESK: {
      headline: "Concierge-level patient onboarding",
      subline:
        "Smart search, queue intelligence, and booking flows crafted for Medstar welcome teams.",
    },
    PATIENT: {
      headline: "Care that travels with you",
      subline:
        "Appointments, invoices, and results in a crisp self-service portal.",
    },
  };

  const heroContent = heroCopyByRole[selectedRole];

  function handleRoleChange(role: UserRole) {
    setSelectedRole(role);
    const defaultUser = demoUsers.find((user) => user.role === role);
    if (defaultUser) {
      setSelectedUserId(defaultUser.id);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const user = login(selectedUserId, selectedHospital);

    if (!user) {
      setError("Unable to locate demo credentials for that role.");
      setIsSubmitting(false);
      return;
    }

    const nextRoute = getDefaultRouteByRole(user.role);
    router.push(nextRoute);
  }

  return (
    <div className="grid h-screen grid-cols-1 overflow-hidden bg-background text-foreground md:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden h-full flex-col justify-between overflow-y-auto bg-linear-to-br from-primary/10 via-primary/5 to-secondary/10 px-16 py-14 text-primary dark:from-primary/20 dark:via-primary/15 dark:to-secondary/15 md:flex">
        <div className="absolute left-16 top-16 inline-flex rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
          Medstar Hospitals Demo
        </div>
        <div className="mt-24 max-w-xl space-y-6 text-primary">
          <h1 className="text-4xl font-semibold leading-tight text-primary">
            {heroContent.headline}
          </h1>
          <p className="text-base text-primary/80">{heroContent.subline}</p>
        </div>
        {/* <div className="mt-auto grid gap-4 text-sm text-primary/70">
          <dl className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.25em]">Network scale</dt>
              <dd className="mt-2 text-2xl font-semibold text-primary">12 campuses</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em]">Daily throughput</dt>
              <dd className="mt-2 text-2xl font-semibold text-primary">5.4k encounters</dd>
            </div>
          </dl>
          <p className="text-xs italic text-primary/70">
            Powered by Gemini for assistive insights • For demo purposes only.
          </p>
        </div> */}
      </section>

      <section className="flex h-full flex-col justify-center overflow-y-auto bg-card px-8 py-12 shadow-2xl sm:px-12">
        <div className="mx-auto w-full max-w-md space-y-8">
          <header className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Login to continue
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              Welcome to Medstar Hospitals HMS
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a persona to explore the enterprise demo. Credentials are pre-configured.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Select role
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left text-xs transition-colors",
                      role === selectedRole
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {ROLE_LABELS[role]}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {demoUsers.filter((user) => user.role === role).length} demo account(s)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Persona
              </label>
              <div className="space-y-2">
                {roleSpecificUsers.map((user: DemoUser) => (
                  <label
                    key={user.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 text-sm transition-colors",
                      selectedUserId === user.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <input
                      type="radio"
                      name="persona"
                      value={user.id}
                      checked={selectedUserId === user.id}
                      onChange={() => setSelectedUserId(user.id)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Demo hospital
              </label>
              <div className="rounded-xl border border-border bg-background px-3 py-2">
                <select
                  value={selectedHospital}
                  onChange={(event) => setSelectedHospital(event.target.value)}
                  className="w-full bg-transparent text-sm text-foreground focus:outline-none"
                >
                  {demoHospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-primary/50 bg-primary text-sm font-semibold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Preparing workspace…" : "Launch demo experience"}
            </button>

            <p className="text-center text-[11px] text-muted-foreground">
              By continuing, you acknowledge this is a simulated environment for showcasing Medstar Hospitals HMS capabilities.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
