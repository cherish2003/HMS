"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Clock,
  CreditCard,
  IdCard,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  bookingPayments,
  dischargeHandovers,
  queueEntries,
  receptionPrompt,
  todayAppointments,
  walkInLeads,
} from "@/mocks/data/front-desk";

const QUEUE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Waiting", value: "waiting" },
  { label: "Checked in", value: "checked-in" },
  { label: "With doctor", value: "with-doctor" },
];

type RegistrationStepKey = "demographics" | "insurance" | "confirmation";

type RegistrationBlueprintEntry = {
  key: RegistrationStepKey;
  title: string;
  description: string;
  checklist: string[];
};

const REGISTRATION_BLUEPRINT: RegistrationBlueprintEntry[] = [
  {
    key: "demographics",
    title: "Demographics",
    description: "Verify core identifiers before creating the chart.",
    checklist: ["Confirm MRN or create provisional", "Validate contact + address", "Capture emergency contact"],
  },
  {
    key: "insurance",
    title: "Insurance",
    description: "Record coverage details to route billing and pre-auth.",
    checklist: ["Capture insurer + policy number", "Upload card photo", "Mark pre-auth requirements"],
  },
  {
    key: "confirmation",
    title: "Consent & Handoff",
    description: "Reconfirm visit logistics and notify the care team.",
    checklist: ["Collect privacy consent", "Confirm visit type + slot", "Send check-in notification"],
  },
];

const RECENT_LOOKUPS = [
  {
    id: "patient-1004",
    name: "Anaya Kapur",
    phone: "+91 98231 11232",
    lastSeen: "2025-11-20T09:40:00+05:30",
    insurance: "HDFC Ergo",
  },
  {
    id: "patient-1022",
    name: "Rahul Menon",
    phone: "+91 99876 44321",
    lastSeen: "2025-11-20T08:55:00+05:30",
    insurance: "Star Health",
  },
  {
    id: "patient-1100",
    name: "Sahana Rao",
    phone: "+91 98111 22145",
    lastSeen: "2025-11-19T17:15:00+05:30",
    insurance: "Self-pay",
  },
];

const SLOT_TEMPLATE = [
  { time: "09:00:00+05:30", doctorId: "doctor-1", specialty: "Medical Oncology" },
  { time: "09:30:00+05:30", doctorId: "doctor-1", specialty: "Medical Oncology" },
  { time: "10:30:00+05:30", doctorId: "doctor-1", specialty: "Medical Oncology" },
  { time: "11:15:00+05:30", doctorId: "doctor-2", specialty: "Cardiology" },
  { time: "12:20:00+05:30", doctorId: "doctor-3", specialty: "Endocrinology" },
  { time: "13:00:00+05:30", doctorId: "doctor-4", specialty: "General Medicine" },
];

const BOOKING_RATE_CARD = [
  { visitType: "OPD", fee: 200, includes: "Standard consult + vitals" },
  { visitType: "Telehealth", fee: 150, includes: "Video consult, digital summary" },
  { visitType: "Second opinion", fee: 350, includes: "Extended consult, case review" },
];

type RegistrationField = {
  label: string;
  value: string;
};

type RegistrationStep = RegistrationBlueprintEntry & {
  fields: RegistrationField[];
};

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [queueFilter, setQueueFilter] = useState<(typeof QUEUE_FILTERS)[number]["value"]>("all");
  const [selectedQueueId, setSelectedQueueId] = useState(queueEntries[0]?.id ?? null);
  const [registrationStep, setRegistrationStep] = useState(0);
  const [kioskQuery, setKioskQuery] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const filteredQueue = useMemo(() => {
    return queueEntries.filter((entry) => {
      const matchesStatus = queueFilter === "all" || entry.status === queueFilter;
      const matchesSearch = searchTerm
        ? entry.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.doctorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [queueFilter, searchTerm]);

  const selectedQueueEntry = useMemo(
    () => filteredQueue.find((entry) => entry.id === selectedQueueId) ?? filteredQueue[0],
    [filteredQueue, selectedQueueId]
  );

  const lead = walkInLeads[0];
  const registrationFlow = useMemo<RegistrationStep[]>(() => {
    const leadName = lead?.name ?? "Walk-in patient";
    return REGISTRATION_BLUEPRINT.map((step) => {
      if (step.key === "demographics") {
        return {
          ...step,
          fields: [
            { label: "Patient name", value: leadName },
            { label: "Mobile", value: lead?.phone ?? "+91 99876 54320" },
            { label: "Email", value: lead?.email ?? "pending@medstar.example" },
            { label: "Preferred language", value: "English" },
          ],
        } satisfies RegistrationStep;
      }
      if (step.key === "insurance") {
        return {
          ...step,
          fields: [
            { label: "Insurer", value: "ICICI Lombard" },
            { label: "Policy number", value: "HOSP-9983-221A" },
            { label: "Coverage", value: "IPD + OPD (₹2L cap)" },
            { label: "Cashless status", value: "Pre-auth not required" },
          ],
        } satisfies RegistrationStep;
      }
      return {
        ...step,
        fields: [
          { label: "Visit type", value: "OPD" },
          { label: "Assigned slot", value: "11:15 AM - Cardiology" },
          { label: "Consent", value: "Digital signature captured" },
          { label: "Notification", value: "Clinician + billing alerted" },
        ],
      } satisfies RegistrationStep;
    });
  }, [lead]);

  useEffect(() => {
    if (registrationStep >= registrationFlow.length) {
      setRegistrationStep(0);
    }
  }, [registrationFlow, registrationStep]);

  const registrationCurrent = registrationFlow[registrationStep] ?? registrationFlow[0];

  const kioskResults = useMemo(() => {
    const term = kioskQuery.trim().toLowerCase();
    if (!term) return RECENT_LOOKUPS;
    return RECENT_LOOKUPS.filter((lookup) =>
      lookup.name.toLowerCase().includes(term) ||
      lookup.id.toLowerCase().includes(term) ||
      lookup.phone.toLowerCase().includes(term)
    );
  }, [kioskQuery]);

  const scheduleDate = todayAppointments[0]?.startAt.split("T")[0] ?? "2025-11-20";
  const bookingSlots = useMemo(() => {
    return SLOT_TEMPLATE.map((slot) => {
      const startAt = `${scheduleDate}T${slot.time}`;
      const appointment = todayAppointments.find((appt) => appt.startAt === startAt);
      return {
        id: startAt,
        startAt,
        doctorId: slot.doctorId,
        specialty: slot.specialty,
        label: formatTime(startAt),
        status: appointment ? "booked" : "available",
        patientId: appointment?.patientId,
        reason: appointment?.reason,
        visitType: appointment?.visitType ?? "OPD",
      } as BookingSlot;
    });
  }, [scheduleDate]);

  useEffect(() => {
    if (selectedSlotId) {
      const stillExists = bookingSlots.some((slot) => slot.id === selectedSlotId);
      if (!stillExists) {
        setSelectedSlotId(null);
      }
      return;
    }
    const firstAvailable = bookingSlots.find((slot) => slot.status === "available");
    if (firstAvailable) {
      setSelectedSlotId(firstAvailable.id);
    }
  }, [bookingSlots, selectedSlotId]);

  const selectedSlot = useMemo(
    () => bookingSlots.find((slot) => slot.id === selectedSlotId) ?? bookingSlots[0],
    [bookingSlots, selectedSlotId]
  );

  const metrics = useMemo(() => {
    const waiting = queueEntries.filter((entry) => entry.status === "waiting").length;
    const checkedIn = queueEntries.filter((entry) => entry.status === "checked-in").length;
    const discharged = dischargeHandovers.length;
    const totalQueue = queueEntries.length;
    return { waiting, checkedIn, discharged, totalQueue };
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Front desk workspace</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Appointments & intake</h1>
            <p className="text-sm text-muted-foreground">
              Manage registrations, queues, and check-ins with live wait intelligence and scripted guidance.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-[hsl(var(--surface-panel))] px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Launch booking wizard
          </button>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1.6fr,1fr]">
        <RegistrationWizardCard
          step={registrationCurrent}
          stepIndex={registrationStep}
          totalSteps={registrationFlow.length}
          onStepChange={setRegistrationStep}
        />
        <SearchKioskCard
          query={kioskQuery}
          onQueryChange={setKioskQuery}
          results={kioskResults}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard
          title="Waiting patients"
          value={`${metrics.waiting}`}
          description="Queued and awaiting doctor call"
        />
        <MetricCard
          title="Checked in"
          value={`${metrics.checkedIn}`}
          description="Vitals captured, ready for consult"
        />
        <MetricCard
          title="Discharge handoffs"
          value={`${metrics.discharged}`}
          description="Pending billing + pharmacy clearance"
        />
        <MetricCard
          title="Total in queue"
          value={`${metrics.totalQueue}`}
          description="Patients actively managed"
        />
      </section>

      <BookingComposerCard
        slots={bookingSlots}
        selectedSlot={selectedSlot}
        onSelectSlot={(slotId) => setSelectedSlotId(slotId)}
        rateCard={BOOKING_RATE_CARD}
      />

      <section className="grid gap-4 xl:grid-cols-[1.8fr,1fr]">
        <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Queue board</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {QUEUE_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setQueueFilter(filter.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    queueFilter === filter.value
                      ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                      : "border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-[hsl(var(--surface-interactive))] px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search patient, doctor, or specialty"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-[hsl(var(--surface-interactive))] text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Doctor</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Wait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filteredQueue.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedQueueId(entry.id)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-[hsl(var(--surface-interactive))]",
                      selectedQueueEntry?.id === entry.id ? "bg-[hsl(var(--surface-strong))]" : undefined
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{entry.patientId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.doctorId}</td>
                    <td className="px-4 py-3"><StatusPill status={entry.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.estimatedWait} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
          <h2 className="text-lg font-semibold text-foreground">Visit context</h2>
          {selectedQueueEntry ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-4 py-3">
                <UserRound className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{selectedQueueEntry.patientId}</p>
                  <p className="text-xs text-muted-foreground">{selectedQueueEntry.specialty}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next step</p>
                <p className="mt-2 text-sm text-foreground">
                  {selectedQueueEntry.status === "waiting"
                    ? "Collect vital signs, confirm insurance, and move to checked-in."
                    : "Patient ready—notify doctor for consult start."}
                </p>
              </div>
              <div className="grid gap-3">
                <InfoRow icon={CalendarDays} label="Appointment" value={selectedQueueEntry.appointmentId} />
                <InfoRow icon={CalendarClock} label="Estimated wait" value={`${selectedQueueEntry.estimatedWait} min`} />
                <InfoRow icon={Clock} label="Queue position" value={`#${selectedQueueEntry.position || 1}`} />
                {selectedQueueEntry.notes ? (
                  <InfoRow icon={ClipboardList} label="Notes" value={selectedQueueEntry.notes} subtle />
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
                  Mark checked-in
                </button>
                <button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]">
                  Text patient update
                </button>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
              Select a queue entry to view context, intake actions, and next steps.
            </p>
          )}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Today's schedule</h2>
            <span className="text-xs text-muted-foreground">{todayAppointments.length} visits</span>
          </header>
          <ul className="space-y-3 text-sm">
            {todayAppointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{appointment.reason}</p>
                  <p className="text-xs text-muted-foreground">{appointment.doctorId} • {formatTime(appointment.startAt)}</p>
                </div>
                <StatusPill status={appointment.status === "checked-in" ? "checked-in" : "waiting"} />
              </li>
            ))}
          </ul>
        </article>

        <div className="space-y-4">
          <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Walk-in leads</h2>
              <button className="text-xs font-semibold text-primary">Register</button>
            </header>
            <ul className="mt-3 space-y-2 text-sm">
              {walkInLeads.map((lead) => (
                <li key={lead.id} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-4 py-3">
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">Added {formatTime(lead.createdAt)}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Booking payments</h2>
              <CreditCard className="h-4 w-4 text-primary" />
            </header>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {bookingPayments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-4 py-3">
                  <span>{payment.invoiceId}</span>
                  <span className="font-medium text-foreground">₹{payment.amount.toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Discharge handovers</h2>
            <PhoneCall className="h-4 w-4 text-primary" />
          </header>
          {dischargeHandovers.length ? (
            <ul className="space-y-3 text-sm">
              {dischargeHandovers.map((handover) => (
                <li key={handover.patientId} className="space-y-2 rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
                  <p className="font-medium text-foreground">{handover.patientId}</p>
                  <p className="text-xs text-muted-foreground">{handover.summary}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Due {formatTime(handover.dueAt)} • Assigned {handover.assignedTo}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
              No discharge handovers pending.
            </p>
          )}
        </article>

        <article className="space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Gemini reception script</h2>
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Draft</span>
          </header>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{receptionPrompt.topic}</p>
          <p className="rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] p-4 text-sm text-muted-foreground">
            {receptionPrompt.output}
          </p>
          <footer className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{receptionPrompt.disclaimer}</span>
            <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
              Copy draft
            </button>
          </footer>
        </article>
      </section>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
};

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-5 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">{description}</p>
    </article>
  );
}

function RegistrationWizardCard({
  step,
  stepIndex,
  totalSteps,
  onStepChange,
}: {
  step: RegistrationStep;
  stepIndex: number;
  totalSteps: number;
  onStepChange: (index: number) => void;
}) {
  const iconMap: Record<RegistrationStepKey, typeof UserPlus | typeof IdCard | typeof ShieldCheck> = {
    demographics: UserPlus,
    insurance: IdCard,
    confirmation: ShieldCheck,
  };
  const Icon = iconMap[step.key];
  return (
    <article className="space-y-5 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Icon className="h-4 w-4 text-primary" />
            Registration wizard
          </div>
          <h2 className="text-lg font-semibold text-foreground">{step.title}</h2>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
        <div className="rounded-full border border-border/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          Step {stepIndex + 1} / {totalSteps}
        </div>
      </header>

      <nav className="flex flex-wrap items-center gap-2 text-xs">
        {REGISTRATION_BLUEPRINT.map((template, index) => (
          <button
            key={template.key}
            onClick={() => onStepChange(index)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-medium transition-colors",
              index < stepIndex
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : index === stepIndex
                ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                : "border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
            )}
          >
            {template.title}
          </button>
        ))}
      </nav>

      <div className="grid gap-4 rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-sm">
        {step.fields.map((field) => (
          <div key={field.label} className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{field.label}</p>
            <p className="text-sm text-foreground">{field.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Checklist</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {step.checklist.map((item) => (
            <li key={item} className="rounded-lg border border-border/60 bg-[hsl(var(--surface-panel))] px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => onStepChange(Math.max(0, stepIndex - 1))}
          className="rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]"
          disabled={stepIndex === 0}
        >
          Back
        </button>
        <button
          onClick={() => onStepChange(Math.min(totalSteps - 1, stepIndex + 1))}
          className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle"
        >
          {stepIndex === totalSteps - 1 ? "Finish registration" : "Next step"}
        </button>
      </div>
    </article>
  );
}

function SearchKioskCard({
  query,
  onQueryChange,
  results,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  results: typeof RECENT_LOOKUPS;
}) {
  return (
    <article className="flex h-full flex-col space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Search kiosk</p>
        <h2 className="text-lg font-semibold text-foreground">Patient lookup</h2>
        <p className="text-sm text-muted-foreground">Search MRN or phone and resume recent registrations.</p>
      </header>
      <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-[hsl(var(--surface-interactive))] px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search patient ID, name, or phone"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <div className="space-y-2 text-sm">
        {results.length ? (
          results.map((lookup) => (
            <div key={lookup.id} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{lookup.name}</p>
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{lookup.id}</span>
              </div>
              <p className="text-xs text-muted-foreground">{lookup.phone} • {lookup.insurance}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Last seen {formatRelativeTime(lookup.lastSeen)}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
            No patients match this query. Use quick registration to create a new record.
          </p>
        )}
      </div>
    </article>
  );
}

type BookingSlot = {
  id: string;
  startAt: string;
  doctorId: string;
  specialty: string;
  label: string;
  status: "available" | "booked";
  patientId?: string;
  reason?: string;
  visitType: string;
};

function BookingComposerCard({
  slots,
  selectedSlot,
  onSelectSlot,
  rateCard,
}: {
  slots: BookingSlot[];
  selectedSlot?: BookingSlot;
  onSelectSlot: (id: string) => void;
  rateCard: typeof BOOKING_RATE_CARD;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[2fr,1fr]">
      <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Booking wizard</p>
            <h2 className="text-lg font-semibold text-foreground">Slot availability</h2>
          </div>
          <span className="text-xs text-muted-foreground">{slots.filter((slot) => slot.status === "available").length} open slots</span>
        </header>
        <div className="grid gap-3 lg:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => slot.status === "available" && onSelectSlot(slot.id)}
              className={cn(
                "flex flex-col items-start rounded-xl border px-4 py-3 text-left shadow-[0_10px_28px_-24px_hsl(var(--shadow-soft))] transition-colors",
                slot.status === "booked"
                  ? "cursor-not-allowed border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground"
                  : selectedSlot?.id === slot.id
                  ? "border-primary/50 bg-[hsl(var(--surface-strong))] text-foreground"
                  : "border-border bg-[hsl(var(--surface-interactive))] text-foreground hover:border-primary/40"
              )}
            >
              <span className="text-sm font-semibold">{slot.label}</span>
              <span className="text-xs text-muted-foreground">{slot.specialty}</span>
              <SlotBadge status={slot.status} />
              {slot.status === "booked" && (
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Booked • {slot.patientId}
                </p>
              )}
            </button>
          ))}
        </div>
      </article>

      <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_42px_-32px_hsl(var(--shadow-soft))]">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Booking summary</p>
          <h2 className="text-lg font-semibold text-foreground">Confirm visit</h2>
          <p className="text-sm text-muted-foreground">Collect booking fee and confirm channel before notifying clinician.</p>
        </header>
        {selectedSlot ? (
          <div className="space-y-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-sm">
            <InfoRow icon={CalendarDays} label="Slot" value={`${selectedSlot.label} • ${selectedSlot.specialty}`} />
            <InfoRow icon={CalendarClock} label="Doctor" value={selectedSlot.doctorId} />
            <InfoRow icon={ClipboardList} label="Visit type" value={selectedSlot.visitType} />
            <InfoRow icon={CreditCard} label="Fee" value="₹200 (collect at desk)" subtle />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
            Select an available slot to generate confirmation summary.
          </p>
        )}

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rate card</p>
          <ul className="space-y-2 text-sm">
            {rateCard.map((item) => (
              <li key={item.visitType} className="flex items-center justify-between rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{item.visitType}</p>
                  <p className="text-xs text-muted-foreground">{item.includes}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">₹{item.fee}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Trigger {"appointment.created"} + payment stub on confirmation.</span>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
            Confirm & notify
          </button>
        </div>
      </article>
    </section>
  );
}

function SlotBadge({ status }: { status: BookingSlot["status"] }) {
  const tone = status === "available" ? "bg-emerald-100 text-emerald-900" : "bg-muted text-muted-foreground";
  return (
    <span className={cn("mt-3 rounded-full px-3 py-1 text-[11px] font-semibold", tone)}>
      {status === "available" ? "Available" : "Booked"}
    </span>
  );
}

type StatusPillProps = {
  status: "waiting" | "checked-in" | "with-doctor" | string;
};

function StatusPill({ status }: StatusPillProps) {
  const map: Record<string, string> = {
    waiting: "bg-amber-100 text-amber-900",
    "checked-in": "bg-emerald-100 text-emerald-900",
    "with-doctor": "bg-sky-100 text-sky-900",
  };

  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", map[status] ?? "bg-muted text-muted-foreground")}>
      {status.replace(/-/g, " ").toUpperCase()}
    </span>
  );
}

type InfoRowProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  subtle?: boolean;
};

function InfoRow({ icon: Icon, label, value, subtle }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className={cn("text-sm", subtle ? "text-muted-foreground" : "text-foreground")}>{value}</p>
      </div>
    </div>
  );
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatRelativeTime(timestamp: string) {
  const now = new Date();
  const target = new Date(timestamp);
  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 60) {
    return `${Math.abs(diffMinutes)} min ${diffMinutes >= 0 ? "from now" : "ago"}`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  return `${Math.abs(diffHours)} hr ${diffHours >= 0 ? "from now" : "ago"}`;
}
