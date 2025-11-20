"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Beaker,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FlaskConical,
  Loader2,
  Microscope,
  Printer,
  RefreshCw,
  Sparkles,
  Syringe,
  TestTube,
} from "lucide-react";

import { useAI } from "@/hooks/use-ai";

import { cn } from "@/lib/utils";
import {
  interpretationDraft,
  labOrders,
  labResults,
  radiologyReports,
  escalations,
} from "@/mocks/data/lab";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Ordered", value: "ordered" },
  { label: "Collected", value: "collected" },
  { label: "Completed", value: "completed" },
];

const PRIORITY_FILTERS = [
  { label: "All priorities", value: "all" },
  { label: "STAT", value: "stat" },
  { label: "Urgent", value: "urgent" },
  { label: "Routine", value: "routine" },
];

const TEST_DEPARTMENTS: Record<string, string> = {
  "T-201": "Hematology",
  "T-203": "Inflammation",
  "T-310": "Biochemistry",
  "T-420": "Electrolytes",
  "T-422": "Electrolytes",
};

const COLLECTION_TEAM: Record<string, { collector: string; site: string; lastScan?: string }> = {
  "LO-900": { collector: "tech-12", lastScan: "2025-11-20T16:55:00+05:30", site: "OPD phlebotomy" },
  "LO-901": { collector: "tech-07", lastScan: "2025-11-20T11:25:00+05:30", site: "Ward - 3B" },
  "LO-905": { collector: "pending", site: "Emergency" },
};

export default function LabPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<(typeof PRIORITY_FILTERS)[number]["value"]>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(labOrders[0]?.id ?? null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(radiologyReports[0]?.id ?? null);
  const [interpretationText, setInterpretationText] = useState("");
  const [interpretationContext, setInterpretationContext] = useState<Record<string, unknown>>({});

  const departmentOptions = useMemo(() => {
    const departments = new Set<string>();
    labOrders.forEach((order) => {
      order.tests.forEach((test) => {
        const dept = TEST_DEPARTMENTS[test.testId];
        if (dept) departments.add(dept);
      });
    });
    return ["all", ...Array.from(departments)];
  }, []);

  const filteredOrders = useMemo(() => {
    return labOrders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
      const orderDept = getOrderDepartment(order);
      const matchesDepartment = departmentFilter === "all" || orderDept === departmentFilter;
      return matchesStatus && matchesPriority && matchesDepartment;
    });
  }, [departmentFilter, priorityFilter, statusFilter]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return filteredOrders[0];
    return filteredOrders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0];
  }, [filteredOrders, selectedOrderId]);

  useEffect(() => {
    if (selectedOrder) {
      const results = labResults.filter((result) => result.orderId === selectedOrder.id);
      setInterpretationContext({
        orderId: selectedOrder.id,
        patientId: selectedOrder.patientId,
        tests: selectedOrder.tests.map(test => test.testId).join(", "),
        results: results.map(r => `${r.testId}: ${r.value} ${r.unit} (Ref: ${r.refRange})`).join("; "),
      });
    }
  }, [selectedOrder]);

  const interpretationAI = useAI({
    type: "lab-interpretation",
    context: interpretationContext,
  });

  useEffect(() => {
    if (interpretationAI.text) {
      setInterpretationText(interpretationAI.text);
    }
  }, [interpretationAI.text]);

  const handleGenerateInterpretation = async () => {
    if (!selectedOrder) return;
    await interpretationAI.generate();
  };

  const verificationQueue = useMemo(() => labResults.filter((result) => !result.verified), []);

  const selectedReport = useMemo(() => {
    if (!selectedReportId) return radiologyReports[0];
    return radiologyReports.find((report) => report.id === selectedReportId) ?? radiologyReports[0];
  }, [selectedReportId]);

  const resultsForSelectedOrder = useMemo(() => {
    if (!selectedOrder) return [] as typeof labResults;
    return labResults.filter((result) => result.orderId === selectedOrder.id);
  }, [selectedOrder]);

  const allSelected = filteredOrders.length > 0 && filteredOrders.every((order) => selectedOrderIds.includes(order.id));
  const batchActionsEnabled = selectedOrderIds.length > 0;

  const [verificationSelection, setVerificationSelection] = useState<string[]>([]);
  const verificationAllSelected = verificationQueue.length > 0 && verificationQueue.every((result) => verificationSelection.includes(result.id));

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((previous) =>
      previous.includes(orderId)
        ? previous.filter((id) => id !== orderId)
        : [...previous, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedOrderIds([]);
      return;
    }
    setSelectedOrderIds(filteredOrders.map((order) => order.id));
  };

  const toggleVerificationSelection = (resultId: string) => {
    setVerificationSelection((previous) =>
      previous.includes(resultId)
        ? previous.filter((id) => id !== resultId)
        : [...previous, resultId]
    );
  };

  const toggleVerificationAll = () => {
    if (verificationAllSelected) {
      setVerificationSelection([]);
      return;
    }
    setVerificationSelection(verificationQueue.map((result) => result.id));
  };

  useEffect(() => {
    if (!filteredOrders.length) {
      setSelectedOrderId(null);
      setSelectedOrderIds([]);
      return;
    }
    if (!selectedOrderId || !filteredOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(filteredOrders[0].id);
    }
    setSelectedOrderIds((previous) => previous.filter((id) => filteredOrders.some((order) => order.id === id)));
  }, [filteredOrders, selectedOrderId]);

  useEffect(() => {
    if (!radiologyReports.length) {
      setSelectedReportId(null);
      return;
    }
    if (!selectedReportId || !radiologyReports.some((report) => report.id === selectedReportId)) {
      setSelectedReportId(radiologyReports[0].id);
    }
  }, [radiologyReports, selectedReportId]);

  useEffect(() => {
    setVerificationSelection((previous) =>
      previous.filter((id) => verificationQueue.some((result) => result.id === id))
    );
  }, [verificationQueue]);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Diagnostics control tower</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Lab & radiology operations</h1>
            <p className="text-sm text-muted-foreground">
              Track orders, mark collections, release reports, and escalate critical findings across modalities.
            </p>
          </div>
          <button 
            onClick={handleGenerateInterpretation}
            disabled={interpretationAI.loading || !selectedOrder}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-[hsl(var(--surface-panel))] px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {interpretationAI.loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Sparkles className="h-4 w-4 text-primary" />}
            {interpretationAI.loading ? "Generating..." : "Generate AI interpretation"}
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.7fr,1fr]">
        <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Orders queue</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-medium transition-colors",
                    statusFilter === filter.value
                      ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                      : "border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                  )}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Priority</span>
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value as (typeof PRIORITY_FILTERS)[number]["value"])}
                  className="rounded-full border border-border/70 bg-[hsl(var(--surface-panel))] px-3 py-1.5 font-medium text-foreground focus:outline-none"
                >
                  {PRIORITY_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Department</span>
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="rounded-full border border-border/70 bg-[hsl(var(--surface-panel))] px-3 py-1.5 font-medium text-foreground focus:outline-none"
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All departments" : dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="ms-auto flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="rounded-full border border-border/70 px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
              >
                {allSelected ? "Clear selection" : "Select all"}
              </button>
              <button
                disabled={!batchActionsEnabled}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  batchActionsEnabled
                    ? "border-primary/40 bg-primary text-primary-foreground shadow-subtle"
                    : "cursor-not-allowed border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground"
                )}
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                Batch collect
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-[hsl(var(--surface-interactive))] text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border/70"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Tests</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-[hsl(var(--surface-interactive))]",
                      selectedOrder?.id === order.id ? "bg-[hsl(var(--surface-strong))]" : undefined
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={(event) => {
                          event.stopPropagation();
                          toggleOrderSelection(order.id);
                        }}
                        className="h-4 w-4 rounded border-border/70"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{order.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.tests.map((test) => test.name).join(", ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getOrderDepartment(order)}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={order.priority} /></td>
                    <td className="px-4 py-3"><LabStatus status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <h2 className="text-lg font-semibold text-foreground">Order detail</h2>
          {selectedOrder ? (
            <div className="space-y-5 text-sm">
              <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Patient</p>
                <p className="text-sm text-foreground">{selectedOrder.patientId}</p>
                <p className="text-xs text-muted-foreground">Requested {formatDateTime(selectedOrder.orderedAt)}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <SampleCollectionPanel order={selectedOrder} />
                <ResultEntryForm order={selectedOrder} results={resultsForSelectedOrder} />
              </div>
              <EscalationLog orderId={selectedOrder.id} />
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
              Select an order to view patient context, sample workflow, and escalation trail.
            </p>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Microscope className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Result verification queue</h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={toggleVerificationAll}
                className="rounded-full border border-border/70 px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
              >
                {verificationAllSelected ? "Clear" : "Select all"}
              </button>
              <button
                disabled={!verificationSelection.length}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  verificationSelection.length
                    ? "border-primary/40 bg-primary text-primary-foreground shadow-subtle"
                    : "cursor-not-allowed border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Verify selected
              </button>
              <span className="text-muted-foreground">{verificationQueue.length} pending</span>
            </div>
          </header>
          <ul className="space-y-3 text-sm">
            {verificationQueue.map((result) => (
              <li key={result.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-4 py-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={verificationSelection.includes(result.id)}
                    onChange={() => toggleVerificationSelection(result.id)}
                    className="h-4 w-4 rounded border-border/70"
                  />
                  <div>
                    <p className="font-medium text-foreground">{result.orderId}</p>
                    <p className="text-xs text-muted-foreground">Test {result.testId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {result.flagged ? (
                    <span className="rounded-full bg-destructive/15 px-3 py-1 text-[11px] font-semibold text-destructive">Flagged</span>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">Normal</span>
                  )}
                  <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
                    Verify
                  </button>
                </div>
              </li>
            ))}
            {!verificationQueue.length && (
              <li className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] px-4 py-3 text-sm text-muted-foreground">
                All results verified.
              </li>
            )}
          </ul>
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Radiology reports</h2>
            </div>
            <span className="text-xs text-muted-foreground">{radiologyReports.length} studies</span>
          </header>
          {radiologyReports.length ? (
            <div className="space-y-4">
              <ul className="space-y-2 text-sm">
                {radiologyReports.map((report) => (
                  <li key={report.id}>
                    <button
                      onClick={() => setSelectedReportId(report.id)}
                      className={cn(
                        "flex w-full flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors",
                        selectedReport?.id === report.id
                          ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                          : "border-border/60 bg-[hsl(var(--surface-interactive))] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      <span className="text-sm font-semibold">{report.modality}</span>
                      <span className="text-[11px] uppercase tracking-[0.2em]">{report.id}</span>
                      <span className="mt-1 text-xs">{report.findings}</span>
                      <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        {report.verifiedAt ? `Verified ${formatTime(report.verifiedAt)}` : "Awaiting verification"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {selectedReport ? <ImagingViewer report={selectedReport} /> : null}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
              No radiology studies available yet.
            </p>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr,1fr]">
        <article className="space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Gemini interpretation draft</h2>
            </div>
            <div className="flex items-center gap-2">
              {interpretationAI.isFallback && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-900">DEMO MODE</span>
              )}
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Draft</span>
            </div>
          </header>
          {selectedOrder && (
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Order {selectedOrder.id}</p>
          )}
          <div className="space-y-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] p-4 text-sm text-muted-foreground">
            {interpretationAI.loading ? (
              <div className="flex items-center justify-center gap-2 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Generating clinical interpretation...</span>
              </div>
            ) : interpretationText ? (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Clinical interpretation</p>
                <p className="whitespace-pre-wrap text-foreground">{interpretationText}</p>
              </div>
            ) : (
              <p className="text-center italic">Click "Generate AI interpretation" to create clinical guidance for lab results</p>
            )}
          </div>
          <footer className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {interpretationAI.isFallback 
                ? "Demo response - configure GEMINI_API_KEY for live AI" 
                : "AI-generated clinical interpretation"}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleGenerateInterpretation}
                disabled={interpretationAI.loading || !selectedOrder}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(interpretationText)}
                disabled={!interpretationText}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="h-3.5 w-3.5" /> Copy summary
              </button>
            </div>
          </footer>
        </article>

        <article className="space-y-3 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Critical escalations</h2>
          </header>
          {escalations.length ? (
            <ul className="space-y-3 text-sm">
              {escalations.map((item) => (
                <li key={item.id} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
                  <p className="font-medium text-foreground">{item.orderId}</p>
                  <p className="text-xs text-muted-foreground">{item.message}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Ack by {item.acknowledgedBy}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
              No escalations pending.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}

type LabStatusProps = {
  status: "ordered" | "collected" | "completed";
};

function LabStatus({ status }: LabStatusProps) {
  const map: Record<string, string> = {
    ordered: "bg-amber-100 text-amber-900",
    collected: "bg-sky-100 text-sky-900",
    completed: "bg-emerald-100 text-emerald-900",
  };

  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", map[status])}>{status.toUpperCase()}</span>
  );
}

type PriorityBadgeProps = {
  priority: "routine" | "urgent" | "stat";
};

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const map: Record<PriorityBadgeProps["priority"], string> = {
    routine: "bg-muted text-muted-foreground",
    urgent: "bg-amber-100 text-amber-900",
    stat: "bg-destructive/15 text-destructive",
  };

  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", map[priority])}>{priority.toUpperCase()}</span>
  );
}

function SampleCollectionPanel({ order }: { order: (typeof labOrders)[number] }) {
  const meta = COLLECTION_TEAM[order.id as keyof typeof COLLECTION_TEAM];
  const pendingCollection = order.status === "ordered";
  const labelsPrinted = Boolean(order.labelsPrinted);

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] p-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>Sample collection</span>
        <span>{pendingCollection ? "Awaiting" : "Captured"}</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-[hsl(var(--surface-interactive))] px-3 py-2">
          <div className="flex items-center gap-2">
            <Syringe className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">{meta?.site ?? "Phlebotomy"}</span>
          </div>
          <span className="text-xs text-muted-foreground">{meta?.collector ?? "assign"}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-[hsl(var(--surface-interactive))] px-3 py-2 text-xs text-muted-foreground">
          <span>Last scan</span>
          <span>{meta?.lastScan ? formatTime(meta.lastScan) : "--"}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-[hsl(var(--surface-interactive))] px-3 py-2 text-xs text-muted-foreground">
          <span>Labels printed</span>
          <span className="font-semibold text-foreground">{labelsPrinted ? "Yes" : "No"}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
          Mark collected
        </button>
        <button className="rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]">
          <Printer className="me-2 inline h-3.5 w-3.5" /> Print labels
        </button>
      </div>
    </div>
  );
}

function ResultEntryForm({
  order,
  results,
}: {
  order: (typeof labOrders)[number];
  results: typeof labResults;
}) {
  const entries = order.tests.map((test) => {
    const result = results.find((item) => item.testId === test.testId);
    return {
      ...test,
      value: result?.value ?? "",
      unit: result?.unit ?? "",
      refRange: result?.refRange ?? "",
      flagged: result?.flagged ?? false,
    };
  });

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] p-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>Result entry</span>
        <span>{order.tests.length} tests</span>
      </div>
      <div className="space-y-3 text-sm">
        {entries.map((entry) => (
          <div key={entry.testId} className="space-y-2 rounded-lg border border-border/60 bg-[hsl(var(--surface-interactive))] p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{entry.name}</p>
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{entry.testId}</span>
            </div>
            <div className="grid gap-2 text-xs">
              <label className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Value</span>
                <input
                  defaultValue={entry.value as string | number}
                  readOnly
                  className="w-32 rounded-md border border-border/60 bg-[hsl(var(--surface-panel))] px-2 py-1 text-right text-sm text-foreground"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Unit</span>
                <input
                  defaultValue={entry.unit}
                  readOnly
                  className="w-24 rounded-md border border-border/60 bg-[hsl(var(--surface-panel))] px-2 py-1 text-right text-sm text-muted-foreground"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Reference</span>
                <input
                  defaultValue={entry.refRange}
                  readOnly
                  className="w-32 rounded-md border border-border/60 bg-[hsl(var(--surface-panel))] px-2 py-1 text-right text-sm text-muted-foreground"
                />
              </label>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" defaultChecked={entry.flagged} className="h-3.5 w-3.5 rounded border-border/70" />
                Flag critical
              </label>
              <button className="text-xs font-semibold text-primary">Attach file</button>
            </div>
          </div>
        ))}
      </div>
      <textarea
        placeholder="Tech notes for verifier..."
        className="h-16 w-full resize-none rounded-lg border border-border/60 bg-[hsl(var(--surface-interactive))] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="flex flex-wrap gap-2 text-xs">
        <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
          Save draft
        </button>
        <button className="rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]">
          Submit for verification
        </button>
      </div>
    </div>
  );
}

function EscalationLog({ orderId }: { orderId: string }) {
  const related = escalations.filter((item) => item.orderId === orderId);

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        Escalations
      </div>
      {related.length ? (
        <ul className="space-y-3 text-sm">
          {related.map((item) => (
            <li key={item.id} className="space-y-1 rounded-lg border border-border/60 bg-[hsl(var(--surface-panel))] p-3">
              <p className="text-foreground">{item.message}</p>
              <p className="text-xs text-muted-foreground">
                Ack by {item.acknowledgedBy} at {formatTime(item.acknowledgedAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No escalations captured.</p>
      )}
    </div>
  );
}

function ImagingViewer({ report }: { report: (typeof radiologyReports)[number] }) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] p-4 text-sm">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>Preview</span>
        <span>{report.modality}</span>
      </div>
      <div className="h-32 rounded-lg border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] text-xs text-muted-foreground">
        <div className="flex h-full flex-col items-center justify-center gap-1">
          <Download className="h-5 w-5 text-primary" />
          <span>Imaging viewer placeholder</span>
        </div>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Findings</p>
        <p className="text-foreground">{report.findings}</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Impression</p>
        <p>{report.impression ?? "--"}</p>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Notify clinician when verified.</span>
        <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
          Download PDF
        </button>
      </div>
    </div>
  );
}

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

function formatTime(timestamp?: string) {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function getOrderDepartment(order: (typeof labOrders)[number]) {
  const departments = order.tests
    .map((test) => TEST_DEPARTMENTS[test.testId])
    .filter((value): value is string => Boolean(value));
  if (!departments.length) return "General diagnostics";
  return Array.from(new Set(departments)).join(" • ");
}
