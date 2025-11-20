"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  ListChecks,
  Sparkles,
  Stethoscope,
  Syringe,
  Tag,
  Thermometer,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  handoverNotes,
  marSchedule,
  nurseTasks,
  vitalsLog,
} from "@/mocks/data/nurse";
import type {
  MARItem,
  MARStatus,
  NurseTask,
  NurseTaskPriority,
  NurseTaskStatus,
  VitalsEntry,
} from "@/types/core";

const TASK_COLUMNS: Array<{ key: NurseTaskStatus; label: string; description: string }> = [
  { key: "pending", label: "Pending", description: "Needs action" },
  { key: "in-progress", label: "In progress", description: "Underway" },
  { key: "snoozed", label: "Snoozed", description: "Deferred" },
  { key: "done", label: "Completed", description: "Signed off" },
];

const PRIORITY_FILTERS = [
  { label: "All priorities", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const STATUS_FILTERS = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export default function NurseDashboardPage() {
  const [priorityFilter, setPriorityFilter] = useState<(typeof PRIORITY_FILTERS)[number]["value"]>("all");
  const [statusView, setStatusView] = useState<(typeof STATUS_FILTERS)[number]["value"]>("active");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(nurseTasks[0]?.id ?? null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(nurseTasks[0]?.patientId ?? vitalsLog[0]?.patientId ?? null);

  const filteredTasks = useMemo(() => {
    return nurseTasks.filter((task) => {
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const isCompleted = task.status === "done";
      const matchesStatus = statusView === "active" ? !isCompleted : isCompleted;
      return matchesPriority && matchesStatus;
    });
  }, [priorityFilter, statusView]);

  const boardTasks = useMemo(() => {
    return TASK_COLUMNS.map((column) => ({
      column,
      items: filteredTasks.filter((task) => task.status === column.key),
    }));
  }, [filteredTasks]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return filteredTasks[0];
    return filteredTasks.find((task) => task.id === selectedTaskId) ?? filteredTasks[0];
  }, [filteredTasks, selectedTaskId]);

  useEffect(() => {
    if (selectedTask) {
      setSelectedTaskId(selectedTask.id);
      setSelectedPatientId(selectedTask.patientId);
    } else if (filteredTasks[0]) {
      setSelectedTaskId(filteredTasks[0].id);
      setSelectedPatientId(filteredTasks[0].patientId);
    }
  }, [filteredTasks, selectedTask]);

  const patientOptions = useMemo(() => {
    const ids = new Set<string>();
    const labelMap = new Map<string, string>();
    nurseTasks.forEach((task) => {
      ids.add(task.patientId);
      labelMap.set(task.patientId, prettifyId(task.patientId));
    });
    vitalsLog.forEach((entry) => {
      ids.add(entry.patientId);
      labelMap.set(entry.patientId, prettifyId(entry.patientId));
    });
    return Array.from(ids).map((id) => ({ id, label: labelMap.get(id) ?? prettifyId(id) }));
  }, []);

  const vitalsForPatient = useMemo(() => {
    if (!selectedPatientId) return [] as VitalsEntry[];
    return vitalsLog
      .filter((entry) => entry.patientId === selectedPatientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedPatientId]);

  const marForPatient = useMemo(() => {
    if (!selectedPatientId) return marSchedule;
    return marSchedule.filter((item) => item.patientId === selectedPatientId);
  }, [selectedPatientId]);

  const metrics = useMemo(() => {
    const criticalTasks = nurseTasks.filter((task) => task.priority === "critical" && task.status !== "done").length;
    const upcomingMeds = marSchedule.filter((item) => item.status === "scheduled").length;
    const delayedMeds = marSchedule.filter((item) => item.status === "delayed").length;
    const vitalsToday = vitalsLog.length;
    return {
      criticalTasks,
      upcomingMeds,
      delayedMeds,
      vitalsToday,
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Nurse station</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Shift orchestration</h1>
            <p className="text-sm text-muted-foreground">
              Coordinate bedside tasks, vitals capture, and medication rounds with confident handovers.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-[hsl(var(--surface-panel))] px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Generate care checklist
          </button>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          icon={AlertTriangle}
          tone="text-destructive"
          label="Critical tasks"
          value={metrics.criticalTasks}
          caption="Require immediate attention"
        />
        <MetricCard
          icon={Syringe}
          tone="text-primary"
          label="Scheduled meds"
          value={metrics.upcomingMeds}
          caption="Upcoming administrations"
        />
        <MetricCard
          icon={BellRing}
          tone="text-amber-600"
          label="Delayed doses"
          value={metrics.delayedMeds}
          caption="Follow-up required"
        />
        <MetricCard
          icon={Activity}
          tone="text-emerald-600"
          label="Vitals logged"
          value={metrics.vitalsToday}
          caption="Entries in this shift"
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <ListChecks className="h-4 w-4 text-primary" />
            Task board
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {PRIORITY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setPriorityFilter(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-semibold transition-colors",
                  priorityFilter === filter.value
                    ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                    : "border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusView(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-semibold transition-colors",
                  statusView === filter.value
                    ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                    : "border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[2.1fr,1fr]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {boardTasks.map(({ column, items }) => (
              <TaskColumn
                key={column.key}
                column={column}
                items={items}
                selectedTaskId={selectedTask?.id ?? null}
                onSelectTask={setSelectedTaskId}
              />
            ))}
          </div>
          <TaskDetailPanel task={selectedTask} onSelectPatient={setSelectedPatientId} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr,1.2fr]">
        <VitalsPanel
          patientId={selectedPatientId}
          patients={patientOptions}
          vitals={vitalsForPatient}
          onSelectPatient={setSelectedPatientId}
        />
        <MedicationPanel mar={marForPatient} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
        <HandoverPanel />
        <AlertPanel />
      </section>
    </div>
  );
}

type MetricCardProps = {
  icon: typeof AlertTriangle;
  tone: string;
  label: string;
  value: number;
  caption: string;
};

function MetricCard({ icon: Icon, tone, label, value, caption }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-5 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <Icon className={cn("h-4 w-4", tone)} />
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{caption}</p>
    </article>
  );
}

type TaskColumnProps = {
  column: { key: NurseTaskStatus; label: string; description: string };
  items: NurseTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
};

function TaskColumn({ column, items, selectedTaskId, onSelectTask }: TaskColumnProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{column.label}</p>
        <p className="text-xs text-muted-foreground">{column.description}</p>
      </div>
      <ul className="space-y-3 text-sm">
        {items.length ? (
          items.map((task) => (
            <li key={task.id}>
              <button
                onClick={() => onSelectTask(task.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left shadow-[0_16px_34px_-32px_hsl(var(--shadow-soft))] transition-colors",
                  selectedTaskId === task.id
                    ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                    : "border-border/60 bg-[hsl(var(--surface-interactive))] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{task.title}</p>
                  <TaskPriorityBadge priority={task.priority} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{prettifyId(task.patientId)}</span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" /> {formatTime(task.dueAt)}
                  </span>
                </div>
              </button>
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] px-4 py-6 text-center text-xs text-muted-foreground">
            No tasks
          </li>
        )}
      </ul>
    </article>
  );
}

function TaskDetailPanel({
  task,
  onSelectPatient,
}: {
  task: NurseTask | undefined;
  onSelectPatient: (patientId: string) => void;
}) {
  if (!task) {
    return (
      <article className="rounded-2xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-6 text-sm text-muted-foreground">
        Select a task to view details, assignments, and escalation history.
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <ClipboardList className="h-4 w-4 text-primary" />
          Task detail
        </div>
        <h2 className="text-lg font-semibold text-foreground">{task.title}</h2>
        <p className="text-xs text-muted-foreground">Assigned to {task.assignedTo}</p>
      </header>
      <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-sm">
        <div className="flex items-center justify-between">
          <TaskPriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
        </div>
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <InfoRow icon={Tag} label="Patient" value={prettifyId(task.patientId)} />
          <InfoRow icon={CalendarClock} label="Due" value={formatTime(task.dueAt)} />
          <InfoRow icon={Stethoscope} label="Ordered by" value={task.createdBy} />
        </div>
      </div>
      <div className="space-y-2 text-xs">
        <p className="uppercase tracking-[0.2em] text-muted-foreground">Actions</p>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle text-xs">
            Reassign task
          </button>
          <button className="rounded-lg border border-border px-3 py-2 font-semibold text-xs text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]">
            Snooze 30 min
          </button>
          <button className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-semibold text-xs text-destructive">
            Escalate to physician
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-xs text-muted-foreground">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Quick links</p>
        <button
          onClick={() => onSelectPatient(task.patientId)}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))] hover:text-foreground"
        >
          <HeartPulse className="h-3.5 w-3.5 text-primary" /> View vitals trend
        </button>
      </div>
    </article>
  );
}

function VitalsPanel({
  patientId,
  patients,
  vitals,
  onSelectPatient,
}: {
  patientId: string | null;
  patients: Array<{ id: string; label: string }>;
  vitals: VitalsEntry[];
  onSelectPatient: (patientId: string) => void;
}) {
  const latest = vitals[0];

  return (
    <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Activity className="h-4 w-4 text-primary" />
          Vitals log
        </div>
        <select
          value={patientId ?? undefined}
          onChange={(event) => onSelectPatient(event.target.value)}
          className="rounded-full border border-border/70 bg-[hsl(var(--surface-interactive))] px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
        >
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.label}
            </option>
          ))}
        </select>
      </header>
      {latest ? (
        <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Most recent</p>
            <span className="text-xs text-muted-foreground">{formatRelative(latest.timestamp)}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <VitalsChip icon={Thermometer} label="Temp" value={`${latest.temp?.toFixed(1) ?? '--'} °C`} critical={!!latest.temp && latest.temp >= 38} />
            <VitalsChip icon={HeartPulse} label="Heart rate" value={`${latest.hr ?? '--'} bpm`} critical={!!latest.hr && latest.hr >= 110} />
            <VitalsChip icon={BarChart2} label="BP" value={latest.bp ?? '--'} />
            <VitalsChip icon={Stethoscope} label="Resp" value={`${latest.rr ?? '--'} rpm`} critical={!!latest.rr && (latest.rr >= 24 || latest.rr <= 12)} />
            <VitalsChip icon={Activity} label="SpO₂" value={`${latest.spo2 ?? '--'}%`} critical={!!latest.spo2 && latest.spo2 <= 93} />
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
          No vitals captured yet for this patient.
        </p>
      )}

      <div className="space-y-3 text-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trend</p>
        <ul className="space-y-2">
          {vitals.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-[hsl(var(--surface-panel))] px-3 py-2 text-xs text-muted-foreground">
              <span>{formatTime(entry.timestamp)}</span>
              <span>{entry.temp?.toFixed(1) ?? '--'} °C • {entry.hr ?? '--'} bpm • {entry.bp ?? '--'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 text-xs">
        <textarea
          placeholder="Add quick note (eg. device source, patient tolerance)"
          className="h-20 w-full resize-none rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]">
            Record later
          </button>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
            Log vitals
          </button>
        </div>
      </div>
    </article>
  );
}

function VitalsChip({
  icon: Icon,
  label,
  value,
  critical,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border px-3 py-2",
      critical ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border/60 bg-[hsl(var(--surface-panel))] text-muted-foreground"
    )}>
      <span className="flex items-center gap-2 text-xs">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function MedicationPanel({ mar }: { mar: MARItem[] }) {
  return (
    <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Syringe className="h-4 w-4 text-primary" />
          Medication rounds
        </div>
        <span className="text-xs text-muted-foreground">{mar.length} orders</span>
      </header>
      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="min-w-full divide-y divide-border/70 text-sm">
          <thead className="bg-[hsl(var(--surface-interactive))] text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Medication</th>
              <th className="px-4 py-3 text-left">Schedule</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {mar.map((item) => (
              <tr key={item.id} className="text-xs text-muted-foreground">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{item.medication}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em]">{item.id}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatTime(item.scheduledAt)}</td>
                <td className="px-4 py-3"><MarStatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-muted-foreground">{item.notes ?? "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-xs">
        <span className="text-muted-foreground">Batch actions fire {"mar.administered"} audit events.</span>
        <div className="flex gap-2">
          <button className="rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]">
            Mark missed
          </button>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
            Confirm administration
          </button>
        </div>
      </div>
    </article>
  );
}

function HandoverPanel() {
  return (
    <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Shift handover generator
        </div>
        <span className="text-xs text-muted-foreground">{handoverNotes.shift} shift • {formatTime(handoverNotes.preparedAt)}</span>
      </header>
      <div className="grid gap-3 text-sm text-muted-foreground">
        <section className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pending tasks</p>
          <ul className="mt-2 list-disc space-y-1 ps-4">
            {handoverNotes.pendingTasks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Critical alerts</p>
          <ul className="mt-2 list-disc space-y-1 ps-4">
            {handoverNotes.criticalAlerts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI draft</p>
        <p className="mt-2 text-foreground">{handoverNotes.aiDraft}</p>
        <footer className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>For nurse review only.</span>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
            Insert into handover
          </button>
        </footer>
      </div>
    </article>
  );
}

function AlertPanel() {
  return (
    <article className="space-y-3 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
      <header className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <BellRing className="h-4 w-4 text-primary" />
        Notifications & escalations
      </header>
      <ul className="space-y-3 text-sm">
        <li className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Overdue medication</p>
          <p>MAR-502 delayed. Pinged pharmacy at 18:10.</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Posted 10 min ago</p>
        </li>
        <li className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Critical vitals</p>
          <p>ICU-05 MAP trending &lt; 65. Physician notified.</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Logged 25 min ago</p>
        </li>
      </ul>
      <button className="w-full rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]">
        View audit log
      </button>
    </article>
  );
}

type TaskPriority = "critical" | "high" | "medium" | "low";

function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, string> = {
    critical: "bg-destructive/15 text-destructive",
    high: "bg-amber-100 text-amber-900",
    medium: "bg-sky-100 text-sky-900",
    low: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", map[priority])}>{priority.toUpperCase()}</span>
  );
}

function TaskStatusBadge({ status }: { status: NurseTaskStatus }) {
  const map: Record<NurseTaskStatus, string> = {
    pending: "bg-muted text-muted-foreground",
    "in-progress": "bg-sky-100 text-sky-900",
    snoozed: "bg-amber-100 text-amber-900",
    done: "bg-emerald-100 text-emerald-900",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", map[status])}>{status.replace(/-/g, " ").toUpperCase()}</span>
  );
}

type MarStatus = "scheduled" | "given" | "delayed" | "missed";

function MarStatusBadge({ status }: { status: MarStatus }) {
  const map: Record<MarStatus, string> = {
    scheduled: "bg-muted text-muted-foreground",
    given: "bg-emerald-100 text-emerald-900",
    delayed: "bg-amber-100 text-amber-900",
    missed: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", map[status] ?? map.scheduled)}>
      {status.toUpperCase()}
    </span>
  );
}

type InfoRowProps = {
  icon: typeof Tag;
  label: string;
  value: string;
};

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function prettifyId(value: string) {
  const cleaned = value.replace(/^patient-/, "");
  return cleaned
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.toUpperCase())
    .join("-");
}

function formatTime(timestamp?: string) {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(timestamp: string) {
  const now = new Date();
  const target = new Date(timestamp);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 60) {
    return `${Math.max(1, Math.abs(diffMinutes))} min ${diffMinutes >= 0 ? "ago" : "from now"}`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  return `${Math.abs(diffHours)} hr ${diffHours >= 0 ? "ago" : "from now"}`;
}
