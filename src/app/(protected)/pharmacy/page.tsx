"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ClipboardCheck,
  Copy,
  Loader2,
  Pill,
  RefreshCw,
  Search,
  Sparkles,
  Stethoscope,
  Warehouse,
} from "lucide-react";

import { useAI } from "@/hooks/use-ai";

import { cn } from "@/lib/utils";
import {
  counselingDraft,
  dispenseHistory,
  dispenseQueue,
  inventoryTransactions,
  medicationCatalog,
} from "@/mocks/data/pharmacy";
import type { InventoryTransaction, Medication } from "@/types/core";

const PRIORITY_FILTERS = [
  { label: "All", value: "all" },
  { label: "STAT", value: "stat" },
  { label: "Urgent", value: "urgent" },
  { label: "Routine", value: "routine" },
];

export default function PharmacyPage() {
  const [priorityFilter, setPriorityFilter] = useState<(typeof PRIORITY_FILTERS)[number]["value"]>("all");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(dispenseQueue[0]?.id ?? null);
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(medicationCatalog[0]?.id ?? null);
  const [counselingNote, setCounselingNote] = useState("");
  const [counselingContext, setCounselingContext] = useState<Record<string, unknown>>({});

  const filteredQueue = useMemo(() => {
    return dispenseQueue.filter((prescription) =>
      priorityFilter === "all" ? true : prescription.priority === priorityFilter
    );
  }, [priorityFilter]);

  const selectedPrescription = useMemo(
    () => filteredQueue.find((item) => item.id === selectedPrescriptionId) ?? filteredQueue[0],
    [filteredQueue, selectedPrescriptionId]
  );

  useEffect(() => {
    if (selectedPrescription) {
      setCounselingContext({
        patientId: selectedPrescription.patientId,
        prescriptionId: selectedPrescription.id,
        medications: selectedPrescription.items.map(item => ({
          name: item.name,
          dose: item.dose,
          frequency: item.frequency,
          route: item.route,
          duration: item.duration,
        })),
      });
    }
  }, [selectedPrescription]);

  const counselingAI = useAI({
    type: "counseling-note",
    context: counselingContext,
  });

  useEffect(() => {
    if (counselingAI.text) {
      setCounselingNote(counselingAI.text);
    }
  }, [counselingAI.text]);

  const handleGenerateCounseling = async () => {
    if (!selectedPrescription) return;
    await counselingAI.generate();
  };

  const filteredInventory = useMemo(() => {
    const term = inventorySearch.trim().toLowerCase();
    if (!term) return medicationCatalog;
    return medicationCatalog.filter((med) =>
      med.name.toLowerCase().includes(term) ||
      med.generic.toLowerCase().includes(term) ||
      med.brand.toLowerCase().includes(term)
    );
  }, [inventorySearch]);

  const selectedMedication = useMemo(() => {
    if (!selectedMedicationId) return filteredInventory[0] ?? null;
    return medicationCatalog.find((med) => med.id === selectedMedicationId) ?? filteredInventory[0] ?? null;
  }, [filteredInventory, selectedMedicationId]);

  const selectedMedicationTransactions = useMemo(() => {
    if (!selectedMedication) return [] as InventoryTransaction[];
    return inventoryTransactions.filter((txn) => txn.medicationId === selectedMedication.id);
  }, [selectedMedication]);

  const metrics = useMemo(() => {
    const criticalStock = medicationCatalog.filter((med) => med.stockQty <= med.reorderLevel).length;
    return {
      queue: dispenseQueue.length,
      inventory: medicationCatalog.length,
      criticalStock,
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Dispensing command center</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Pharmacy workspace</h1>
            <p className="text-sm text-muted-foreground">
              Prioritize prescriptions, manage stock, handle substitutions, and sync with discharge workflows.
            </p>
          </div>
          <button 
            onClick={handleGenerateCounseling}
            disabled={counselingAI.loading || !selectedPrescription}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-[hsl(var(--surface-panel))] px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {counselingAI.loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Sparkles className="h-4 w-4 text-primary" />}
            {counselingAI.loading ? "Generating..." : "Draft counseling note"}
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard title="Queue" value={`${metrics.queue}`} description="Prescriptions awaiting dispensing" />
        <MetricCard title="Inventory SKUs" value={`${metrics.inventory}`} description="Active medication catalogue" />
        <MetricCard title="Critical stock" value={`${metrics.criticalStock}`} description="At or below reorder level" />
      </section>

      <section className="grid gap-4 2xl:grid-cols-[1.5fr,1fr]">
        <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Dispense queue</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {PRIORITY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setPriorityFilter(filter.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-medium transition-colors",
                    priorityFilter === filter.value
                      ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                      : "border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-[hsl(var(--surface-interactive))] text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Prescription</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedPrescriptionId(item.id)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-[hsl(var(--surface-interactive))]",
                      selectedPrescription?.id === item.id ? "bg-[hsl(var(--surface-strong))]" : undefined
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{item.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.items.length}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={item.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <h2 className="text-lg font-semibold text-foreground">Prescription detail</h2>
          {selectedPrescription ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Patient</p>
                <p className="text-sm text-foreground">{selectedPrescription.patientId}</p>
                <p className="text-xs text-muted-foreground">Ordered {formatTime(selectedPrescription.createdAt)}</p>
              </div>
              <div className="space-y-3">
                {selectedPrescription.items.map((item) => (
                  <div key={item.drugId} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <span className="text-xs text-muted-foreground">{item.frequency}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.dose} • {item.route} • {item.duration}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 text-muted-foreground">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded border-border/70" defaultChecked={!item.generic} />
                        Dispense brand
                      </label>
                      <button className="text-xs font-semibold text-primary">Suggest generic</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
                  Mark dispensed
                </button>
                <button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))]">
                  Hold for clarification
                </button>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
              Select a prescription to review items, substitutions, and dispensing actions.
            </p>
          )}
        </article>
      </section>

      <section className="grid gap-4 2xl:grid-cols-[1.3fr,1fr]">
        <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Inventory catalogue</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-[hsl(var(--surface-interactive))] px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={inventorySearch}
                onChange={(event) => setInventorySearch(event.target.value)}
                placeholder="Search by name or generic"
                className="w-40 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </header>
          <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-[hsl(var(--surface-interactive))] text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Medication</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Formulation</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filteredInventory.map((med) => (
                  <tr
                    key={med.id}
                    onClick={() => setSelectedMedicationId(med.id)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-[hsl(var(--surface-interactive))]",
                      selectedMedication?.id === med.id ? "bg-[hsl(var(--surface-strong))]" : undefined
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.generic} • {med.brand}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{med.stockQty}</td>
                    <td className="px-4 py-3 text-muted-foreground">{med.formulation}</td>
                    <td className="px-4 py-3">
                      <StockBadge stock={med.stockQty} threshold={med.reorderLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MedicationDetailCard medication={selectedMedication} transactions={selectedMedicationTransactions} />
        </article>

        <div className="space-y-4">
          <StockAdjustmentForm medications={medicationCatalog} initialMedicationId={selectedMedication?.id} />
          <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Stock movements</h2>
              </div>
              <span className="text-xs text-muted-foreground">Today</span>
            </header>
            <ul className="mt-3 space-y-2 text-sm">
              {inventoryTransactions.map((txn) => (
                <li key={txn.id} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-4 py-3">
                  <p className="font-medium text-foreground">{txn.type.toUpperCase()} • {txn.qty} units</p>
                  <p className="text-xs text-muted-foreground">{txn.reason}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Recent dispensing</h2>
              </div>
              <span className="text-xs text-muted-foreground">Audit log</span>
            </header>
            <ul className="mt-3 space-y-2 text-sm">
              {dispenseHistory.map((record) => (
                <li key={record.id} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-4 py-3">
                  <p className="font-medium text-foreground">{record.prescriptionId}</p>
                  <p className="text-xs text-muted-foreground">Items {record.items.length} • {formatTime(record.dispensedAt)}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
        <header className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Gemini counseling draft</h2>
          </div>
          <div className="flex items-center gap-2">
            {counselingAI.isFallback && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-900">DEMO MODE</span>
            )}
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Draft</span>
          </div>
        </header>
        {selectedPrescription && (
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{selectedPrescription.id}</p>
        )}
        <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] p-4 text-sm text-muted-foreground">
          {counselingAI.loading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Generating counseling guidance...</span>
            </div>
          ) : counselingNote ? (
            <p className="whitespace-pre-wrap">{counselingNote}</p>
          ) : (
            <p className="text-center italic">Click "Draft counseling note" to generate AI-powered medication counseling guidance</p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {counselingAI.isFallback 
              ? "Demo response - configure GEMINI_API_KEY for live AI" 
              : "AI-generated guidance for patient counseling"}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={handleGenerateCounseling}
              disabled={counselingAI.loading || !selectedPrescription}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(counselingNote)}
              disabled={!counselingNote}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy className="h-3.5 w-3.5" /> Copy note
            </button>
          </div>
        </div>
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
    <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-5 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">{description}</p>
    </article>
  );
}

type PriorityBadgeProps = {
  priority: "stat" | "urgent" | "routine";
};

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const map: Record<string, string> = {
    stat: "bg-destructive/15 text-destructive",
    urgent: "bg-amber-100 text-amber-900",
    routine: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", map[priority])}>{priority.toUpperCase()}</span>
  );
}

type StatusBadgeProps = {
  status: string;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, string> = {
    prescribed: "bg-sky-100 text-sky-900",
    dispensed: "bg-emerald-100 text-emerald-900",
    draft: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", map[status] ?? "bg-muted text-muted-foreground")}>
      {status.toUpperCase()}
    </span>
  );
}

type StockBadgeProps = {
  stock: number;
  threshold: number;
};

function StockBadge({ stock, threshold }: StockBadgeProps) {
  const tone = stock <= threshold
    ? "bg-destructive/15 text-destructive"
    : stock - threshold < 20
    ? "bg-amber-100 text-amber-900"
    : "bg-emerald-100 text-emerald-900";

  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", tone)}>
      {stock <= threshold ? "Reorder" : "In stock"}
    </span>
  );
}

type MedicationDetailCardProps = {
  medication: Medication | null;
  transactions: InventoryTransaction[];
};

function MedicationDetailCard({ medication, transactions }: MedicationDetailCardProps) {
  if (!medication) {
    return (
      <section className="mt-4 rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
        Select a medication to view formulation details, reorder thresholds, and recent adjustments.
      </section>
    );
  }

  return (
    <section className="mt-4 space-y-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-sm">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{medication.name}</p>
          <p className="text-xs text-muted-foreground">{medication.generic} • {medication.brand}</p>
        </div>
        <span className="rounded-full border border-border/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          {medication.formulation}
        </span>
      </header>
      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <InfoPill label="Pack size" value={medication.packSize} />
        <InfoPill label="Stock on hand" value={`${medication.stockQty}`} highlight={medication.stockQty <= medication.reorderLevel} />
        <InfoPill label="Reorder level" value={`${medication.reorderLevel}`} />
        <InfoPill label="Status" value={medication.stockQty <= medication.reorderLevel ? "Needs reorder" : "Stable"} />
      </div>
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Recent activity</p>
        {transactions.length ? (
          <ul className="space-y-2 text-xs text-muted-foreground">
            {transactions.map((txn) => (
              <li key={txn.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-[hsl(var(--surface-panel))] px-3 py-2">
                <span className="font-medium text-foreground">{txn.type.toUpperCase()}</span>
                <span>
                  {txn.qty > 0 ? `+${txn.qty}` : txn.qty} • {txn.reason} • {formatTime(txn.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border/60 bg-[hsl(var(--surface-panel))] px-3 py-2 text-xs text-muted-foreground">
            No logged adjustments for this medication today.
          </p>
        )}
      </div>
    </section>
  );
}

type InfoPillProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function InfoPill({ label, value, highlight }: InfoPillProps) {
  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border px-3 py-2",
      highlight ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border/60 bg-[hsl(var(--surface-panel))] text-muted-foreground"
    )}>
      <span className="text-[11px] uppercase tracking-[0.2em]">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

type StockAdjustmentFormProps = {
  medications: Medication[];
  initialMedicationId?: string | null;
};

function StockAdjustmentForm({ medications, initialMedicationId }: StockAdjustmentFormProps) {
  const [medicationId, setMedicationId] = useState(initialMedicationId ?? medications[0]?.id ?? "");
  const [type, setType] = useState<InventoryTransaction["type"]>("adjustment");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialMedicationId) {
      setMedicationId(initialMedicationId);
    } else if (!medicationId && medications[0]) {
      setMedicationId(medications[0].id);
    }
  }, [initialMedicationId, medicationId, medications]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!medicationId || !qty.trim()) return;
    setSubmitted(true);
    setReason("");
    setQty("");
    window.setTimeout(() => setSubmitted(false), 3000);
  };

  const selectedMedication = medications.find((med) => med.id === medicationId);

  return (
    <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Stock adjustment</h2>
        </div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Simulated</span>
      </header>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Medication</label>
          <select
            value={medicationId}
            onChange={(event) => setMedicationId(event.target.value)}
            className="w-full rounded-lg border border-border/70 bg-[hsl(var(--surface-interactive))] px-3 py-2 text-sm text-foreground focus:outline-none"
          >
            {medications.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name} • {med.formulation}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Adjustment type</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as InventoryTransaction["type"])}
              className="w-full rounded-lg border border-border/70 bg-[hsl(var(--surface-interactive))] px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="adjustment">Manual recount</option>
              <option value="return">Returns</option>
              <option value="reorder">Supplier receipt</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quantity</label>
            <input
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              type="number"
              step="1"
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-border/70 bg-[hsl(var(--surface-interactive))] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notes</label>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="Record reason for adjustment (damage, recount variance, etc.)"
            className="w-full rounded-lg border border-border/70 bg-[hsl(var(--surface-interactive))] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle"
        >
          Log adjustment
        </button>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          No API calls are made—entries sync to pharmacy audit scripts in demo mode.
        </p>
        {submitted && selectedMedication ? (
          <p className="rounded-lg border border-emerald-300/40 bg-emerald-100/40 px-3 py-2 text-xs text-emerald-900">
            Adjustment drafted for {selectedMedication.name}. Notify inventory controller for approval.
          </p>
        ) : null}
      </form>
    </article>
  );
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
