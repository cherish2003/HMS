"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ClipboardSignature,
  FlaskConical,
  Pill,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  doctorSchedule,
  encounterWorkspace,
  labInboxItems,
  roundingBoard,
  draftPrescriptions,
  type DoctorScheduleEntry,
  type EncounterWorkspace,
  type LabInboxItem,
} from "@/mocks/data/doctor";
import { patientRoster } from "@/mocks/data/patients";
import type { AppointmentStatus, Prescription } from "@/types/core";
import type { Patient } from "@/types/patient";

const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  "checked-in": "Checked-in",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_OPTIONS: AppointmentStatus[] = [
  "in-progress",
  "checked-in",
  "scheduled",
  "completed",
];

export default function DoctorDashboardPage() {
  const [schedule, setSchedule] = useState<DoctorScheduleEntry[]>(doctorSchedule);
  const [activeAppointment, setActiveAppointment] = useState<string | null>(doctorSchedule[0]?.id ?? null);
  const [aiDraftVisible, setAiDraftVisible] = useState(false);

  const selectedAppointment = useMemo(
    () => schedule.find((entry) => entry.id === activeAppointment) ?? schedule[0],
    [activeAppointment, schedule]
  );

  const encounterContext: EncounterWorkspace | undefined = useMemo(() => {
    if (!selectedAppointment) return undefined;
    return encounterWorkspace.find((encounter) => encounter.appointmentId === selectedAppointment.id);
  }, [selectedAppointment]);

  const selectedPatient: Patient | undefined = useMemo(() => {
    if (!selectedAppointment) return undefined;
    return patientRoster.find((candidate) => candidate.id === selectedAppointment.patientId);
  }, [selectedAppointment]);

  const activePrescription: Prescription | undefined = useMemo(() => {
    if (!encounterContext) return undefined;
    return draftPrescriptions.find((item) => item.encounterId === encounterContext.id);
  }, [encounterContext]);

  function handleStatusChange(id: string, status: AppointmentStatus) {
    setSchedule((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status,
              checkInStatus:
                status === "in-progress"
                  ? "In progress"
                  : status === "checked-in"
                  ? "Checked-in"
                  : status === "completed"
                  ? "Completed"
                  : "Pending",
            }
          : entry
      )
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Clinician cockpit</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Today’s consults</h1>
            <p className="text-sm text-muted-foreground">
              Manage appointments, encounters, labs, and discharges with AI assist in a single workspace.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5"
            onClick={() => setAiDraftVisible(true)}
          >
            <Sparkles className="h-3.5 w-3.5" /> Draft discharge with Gemini
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,1.6fr]">
        <article className="rounded-2xl border border-border bg-card/80 p-5 shadow-subtle">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Schedule</p>
              <h2 className="text-lg font-semibold text-foreground">Morning clinic</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              {schedule.length} slots
            </span>
          </header>

          <ul className="mt-4 space-y-3 text-sm">
            {schedule.map((appointment) => (
              <li
                key={appointment.id}
                className={cn(
                  "rounded-xl border px-4 py-3 transition-colors",
                  appointment.id === selectedAppointment?.id
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-background hover:border-primary/40"
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setActiveAppointment(appointment.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {appointment.patientInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.reason}</p>
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        <span>{formatTime(appointment.startAt)}</span>
                        <span>•</span>
                        <span>{appointment.visitType}</span>
                        <span>•</span>
                        <span>{appointment.room ?? "TBD"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs">
                    <select
                      value={appointment.status}
                      onChange={(event) =>
                        handleStatusChange(appointment.id, event.target.value as AppointmentStatus)
                      }
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {APPOINTMENT_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-[11px] font-semibold",
                        appointment.checkInStatus === "In progress"
                          ? "bg-primary/10 text-primary"
                          : appointment.checkInStatus === "Checked-in"
                          ? "bg-secondary/15 text-secondary"
                          : appointment.checkInStatus === "Completed"
                          ? "bg-muted/80 text-muted-foreground"
                          : "bg-muted px-2 py-1 text-muted-foreground"
                      )}
                    >
                      {appointment.checkInStatus}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Encounter workspace</p>
              <h2 className="text-lg font-semibold text-foreground">
                {selectedAppointment?.patientName ?? "Select a patient"}
              </h2>
            </div>
            {selectedAppointment ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  {APPOINTMENT_STATUS_LABELS[selectedAppointment.status]}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                  {selectedAppointment.visitType}
                </span>
              </div>
            ) : null}
          </header>

          {selectedPatient ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-border/70 bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">Patient summary</p>
                    <p className="text-xs text-muted-foreground">
                      MRN {selectedPatient.mrn} • {selectedPatient.age} yrs • {selectedPatient.sex}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span>{selectedPatient.tags.join(" · ")}</span>
                  </div>
                </div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Primary consultant • {selectedPatient.primaryDoctor}</p>
                    <p>Last visit • {selectedPatient.lastVisit}</p>
                    <p>Location • {selectedPatient.location}</p>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Phone • {selectedPatient.phone}</p>
                    {selectedPatient.email ? <p>Email • {selectedPatient.email}</p> : null}
                  </div>
                </div>
              </div>

              {encounterContext ? (
                <div className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      SOAP note
                    </span>
                    <button className="inline-flex items-center gap-1 text-primary">
                      <ClipboardSignature className="h-3.5 w-3.5" /> Sign note
                    </button>
                  </div>
                  <p className="text-sm text-foreground">{encounterContext.notes}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <EncounterBadge label="Problems" value={encounterContext.problemList.join(" · ")} />
                    <EncounterBadge label="Vitals" value={encounterContext.vitalsSummary} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {encounterContext.attachments.map((file) => (
                      <span key={file.id} className="rounded-full bg-muted px-2 py-1">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                  Start encounter when the patient arrives to capture vitals and notes.
                </div>
              )}

              {activePrescription ? (
                <div className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Draft prescription
                    </span>
                    <button className="inline-flex items-center gap-1 text-primary">
                      <Pill className="h-3.5 w-3.5" /> Send to pharmacy
                    </button>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {activePrescription.items.map((item) => (
                      <li key={item.drugId} className="rounded-lg border border-border/60 bg-background px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{item.name}</span>
                          <span className="text-[11px] uppercase tracking-[0.2em]">
                            {item.frequency} • {item.duration}
                          </span>
                        </div>
                        <p className="text-xs">{item.dose} {item.route}</p>
                        {item.instructions ? (
                          <p className="text-xs text-muted-foreground">{item.instructions}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
              Select an appointment to load encounter context.
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <article className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Lab & radiology inbox</h2>
            </div>
            <span className="rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-semibold text-secondary">
              {labInboxItems.length} items
            </span>
          </header>
          <ul className="mt-4 space-y-3 text-sm">
            {labInboxItems.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-xl border px-4 py-3",
                  item.critical
                    ? "border-destructive/60 bg-destructive/10"
                    : "border-border/70 bg-background"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.patientName}</p>
                    <p className="text-xs text-muted-foreground">{item.department}</p>
                    <p className="mt-2 text-sm text-foreground">{item.summary}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                    <span>{formatTime(item.receivedAt)}</span>
                    {item.critical ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/20 px-2 py-1 text-[11px] font-semibold text-destructive">
                        <AlertTriangle className="h-3 w-3" /> Critical
                      </span>
                    ) : null}
                    <button className="text-primary underline-offset-2 hover:underline">
                      Open order
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Inpatient rounding</h2>
            </div>
            <button className="text-xs font-medium text-primary">Open ward board</button>
          </header>
          <ul className="mt-4 space-y-3 text-sm">
            {roundingBoard.map((card) => (
              <li key={card.patientId} className="rounded-xl border border-border/70 bg-background px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{card.name}</p>
                    <p className="text-xs text-muted-foreground">{card.location}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                      card.acuity === "Critical"
                        ? "bg-destructive/15 text-destructive"
                        : card.acuity === "Watch"
                        ? "bg-secondary/15 text-secondary"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {card.acuity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Updated {relativeTime(card.lastUpdate)}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {card.tasksDue.map((task) => (
                    <li key={task}>• {task}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {aiDraftVisible ? (
        <article className="space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Gemini discharge draft</h2>
            </div>
            <button
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setAiDraftVisible(false)}
            >
              Dismiss
            </button>
          </header>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            For clinician review only. Not a substitute for medical judgement.
          </p>
          <div className="space-y-2 rounded-xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
            <p className="text-foreground">Admission reason</p>
            <p>
              Patient admitted for cycle 3 chemotherapy following partial response in breast carcinoma. Presented today for cycle review and symptom control.
            </p>
            <p className="text-foreground">Hospital course</p>
            <p>
              Chemo delivered without acute reactions. Mild nausea managed with ondansetron. LFT shows mild ALT elevation; monitor weekly. ANC trending low; repeat CBC in 48h.
            </p>
            <p className="text-foreground">Discharge medications</p>
            <ul className="list-inside list-disc">
              <li>Ondansetron 4mg TID × 5 days</li>
              <li>Pantoprazole 40mg OD × 14 days</li>
            </ul>
            <p className="text-foreground">Follow-up</p>
            <p>
              Review in oncology day care on 24 Nov, bring symptom diary. Immediate escalation if fever &gt;38°C or uncontrolled vomiting.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
              Insert into note
            </button>
            <button className="rounded-lg border border-border px-3 py-2 text-muted-foreground transition-colors hover:bg-muted">
              Regenerate
            </button>
          </div>
        </article>
      ) : null}
    </div>
  );
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(timestamp: string) {
  const now = Date.now();
  const target = new Date(timestamp).getTime();
  const diff = now - target;
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

type EncounterBadgeProps = {
  label: string;
  value: string;
};

function EncounterBadge({ label, value }: EncounterBadgeProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-muted-foreground">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  );
}
