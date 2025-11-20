"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Mail, Phone, Stethoscope, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { patientRoster } from "@/mocks/data/patients";
import type { Patient, PatientStatus } from "@/types/patient";

const STATUS_FILTERS: Array<{ label: string; value: PatientStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Inpatients", value: "IP" },
  { label: "Outpatients", value: "OP" },
  { label: "Discharged", value: "Discharged" },
];

const SAVED_VIEWS = ["Today OPD", "Recent discharges", "High risk", "Insurance follow-ups"];

export default function PatientsPage() {
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "ALL">("ALL");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    if (statusFilter === "ALL") {
      return patientRoster;
    }
    return patientRoster.filter((patient) => patient.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Medstar CRM Workspace</p>
          <h1 className="text-3xl font-semibold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Segment, triage, and collaborate on patient journeys with drawer-based insights and AI add-ons coming soon.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
            Manage saved views
          </button>
          <button className="rounded-lg border border-primary/50 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5">
            + New patient
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-subtle">
        <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-background p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-3 md:max-w-lg">
            <input
              placeholder="Search name, MRN, phone..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted">
              Advanced filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === filter.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SAVED_VIEWS.map((view) => (
            <button
              key={view}
              type="button"
              className="rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {view}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70 bg-background">
          <table className="min-w-full divide-y divide-border/60 text-sm">
            <thead className="bg-muted/70 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">MRN</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Age / Sex</th>
                <th className="px-4 py-3 text-left">Last visit</th>
                <th className="px-4 py-3 text-left">Primary consultant</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-left">Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{patient.mrn}</td>
                  <td className="px-4 py-3 text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                        {patient.avatarInitials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{patient.name}</p>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {patient.encounter.department}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {patient.age} / {patient.sex}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{patient.lastVisit}</td>
                  <td className="px-4 py-3 text-muted-foreground">{patient.primaryDoctor}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-semibold",
                        patient.status === "IP"
                          ? "bg-secondary/15 text-secondary"
                          : patient.status === "OP"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/80 text-muted-foreground"
                      )}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {patient.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted/60 px-2 py-1 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {patient.alerts.length ? patient.alerts[0] : "No alerts"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedPatient && (
        <PatientDetailDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}

type PatientDetailDrawerProps = {
  patient: Patient;
  onClose: () => void;
};

function PatientDetailDrawer({ patient, onClose }: PatientDetailDrawerProps) {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close patient details"
        onClick={onClose}
      />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col gap-6 overflow-y-auto border-l border-border bg-[hsl(var(--surface-panel))] px-6 py-6 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Patient profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{patient.name}</h2>
            <p className="text-sm text-muted-foreground">
              MRN {patient.mrn} • {patient.location}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {patient.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-background p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close patient details"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <section className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Encounter summary</p>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-foreground">
              <Stethoscope className="h-4 w-4 text-primary" /> {patient.encounter.department}
            </p>
            <p className="text-muted-foreground">Admitted on {patient.encounter.admittedOn}</p>
            <p className="text-muted-foreground">Attending: {patient.encounter.attendingPhysician}</p>
            <p className="text-muted-foreground">Primary diagnosis: {patient.encounter.primaryDiagnosis}</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Last update {patient.encounter.lastUpdated}
            </p>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Alerts</p>
          {patient.alerts.length ? (
            <ul className="space-y-2 text-sm text-destructive">
              {patient.alerts.map((alert) => (
                <li key={alert} className="flex items-start gap-2">
                  <AlertTriangle className="mt-px h-4 w-4" />
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No active alerts.</p>
          )}
        </section>

        <section className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Billing summary</p>
          <p className="text-2xl font-semibold text-foreground">{formatter.format(patient.billing.outstandingAmount)}</p>
          <p className="text-sm text-muted-foreground">
            Coverage: {patient.billing.coverageType} • Last invoice {patient.billing.lastInvoiceId}
          </p>
          <button className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15">
            Open invoice timeline
          </button>
        </section>

        <section className="space-y-2 rounded-xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contacts</p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" /> {patient.phone}
          </p>
          {patient.email && (
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> {patient.email}
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
