"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  Receipt,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import { useAI } from "@/hooks/use-ai";
import { usePayment } from "@/hooks/use-payment";

import { cn } from "@/lib/utils";
import {
  documents,
  patientAiDraft,
  patientInvoices,
  patientOverview,
  supportTickets,
  upcomingAppointments,
} from "@/mocks/data/patient-portal";
import type { Appointment, Invoice, PatientDocument, SupportRequest } from "@/types/core";

const APPOINTMENT_STATUS_TONE: Record<Appointment["status"], string> = {
  scheduled: "bg-sky-100 text-sky-900",
  "checked-in": "bg-emerald-100 text-emerald-900",
  "in-progress": "bg-amber-100 text-amber-900",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

const SUPPORT_STATUS_TONE: Record<SupportRequest["status"], string> = {
  open: "bg-amber-100 text-amber-900",
  responded: "bg-emerald-100 text-emerald-900",
  closed: "bg-muted text-muted-foreground",
};

const DOCUMENT_FILTERS: Array<{ label: string; value: "all" | PatientDocument["category"] }> = [
  { label: "All", value: "all" },
  { label: "Lab results", value: "lab" },
  { label: "Discharge", value: "discharge" },
  { label: "Documents", value: "document" },
];

export default function PatientPortalPage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    patientInvoices.find((invoice) => invoice.status !== "paid")?.id ?? patientInvoices[0]?.id ?? null
  );
  const [selectedDocFilter, setSelectedDocFilter] = useState<(typeof DOCUMENT_FILTERS)[number]["value"]>("all");
  const [aiExplanation, setAiExplanation] = useState<string>(patientAiDraft.summary);

  const outstandingInvoices = useMemo(
    () => patientInvoices.filter((invoice) => invoice.status === "unpaid" || invoice.status === "pending"),
    []
  );

  const outstandingBalance = useMemo(
    () => outstandingInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
    [outstandingInvoices]
  );

  const scheduledAppointments = useMemo(
    () => upcomingAppointments.filter((appointment) => appointment.status === "scheduled"),
    []
  );

  const filteredDocuments = useMemo(() => {
    if (selectedDocFilter === "all") return documents;
    return documents.filter((doc) => doc.category === selectedDocFilter);
  }, [selectedDocFilter]);

  const selectedInvoice = useMemo(() => {
    if (!selectedInvoiceId) return outstandingInvoices[0] ?? patientInvoices[0];
    return patientInvoices.find((invoice) => invoice.id === selectedInvoiceId) ?? patientInvoices[0] ?? null;
  }, [selectedInvoiceId]);

  const invoiceAI = useAI({
    type: "invoice-explanation",
    context: {
      invoiceId: selectedInvoice?.id || "",
      total: selectedInvoice?.total || 0,
      items: selectedInvoice?.lines || [],
      insurance: "Self-pay",
    },
  });

  useEffect(() => {
    if (invoiceAI.text) {
      setAiExplanation(invoiceAI.text);
    }
  }, [invoiceAI.text]);

  const handleGenerateExplanation = async () => {
    await invoiceAI.generate();
  };

  const metrics = {
    upcoming: scheduledAppointments.length,
    docs: documents.length,
    outstanding: outstandingBalance,
    support: supportTickets.filter((ticket) => ticket.status === "open").length,
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Patient portal</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Hello, {patientOverview.name}</h1>
            <p className="text-sm text-muted-foreground">
              Manage appointments, invoices, records, and support requests from one connected space.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-[hsl(var(--surface-panel))] px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Summarize my visit
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard label="Upcoming visits" value={`${metrics.upcoming}`} description="Scheduled appointments" icon={CalendarClock} />
        <MetricCard label="Documents" value={`${metrics.docs}`} description="Available downloads" icon={FileText} />
        <MetricCard label="Balance due" value={formatCurrency(metrics.outstanding)} description="Outstanding invoices" icon={CreditCard} tone="text-destructive" />
        <MetricCard label="Open requests" value={`${metrics.support}`} description="Waiting for response" icon={MessageCircle} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Appointments</h2>
            </div>
            <span className="text-xs text-muted-foreground">MRN {patientOverview.mrn}</span>
          </header>
          <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Care team</p>
            <p className="text-sm font-semibold text-foreground">{patientOverview.primaryDoctor}</p>
            <p className="text-xs text-muted-foreground">Allergies: {patientOverview.allergies.join(", ") || "None"}</p>
          </div>
          <ul className="space-y-3 text-sm">
            {upcomingAppointments.map((appointment) => (
              <li key={appointment.id} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{appointment.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatVisitWindow(appointment)}</p>
                  </div>
                  <StatusBadge tone={APPOINTMENT_STATUS_TONE[appointment.status]} label={appointment.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{appointment.visitType}</span>
                  <span>Doctor ID: {appointment.doctorId}</span>
                  {appointment.room ? <span>Room {appointment.room}</span> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button className="rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))]">
                    Check in
                  </button>
                  <button className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-semibold text-destructive">
                    Cancel visit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center gap-2">
            <UserCircle2 className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
          </header>
          <div className="space-y-3 text-sm">
            <ActionButton label="Book new appointment" description="Browse doctor availability" />
            <ActionButton label="Reschedule" description="Update time or visit type" />
            <ActionButton label="Download insurance letter" description="Latest authorization on file" />
          </div>
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Health summary</p>
            <p className="mt-2 text-foreground">
              Active problems: {patientOverview.activeProblems.join(", ")}. Stay hydrated and continue home meds as advised.
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Records & documents</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {DOCUMENT_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedDocFilter(filter.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-semibold transition-colors",
                    selectedDocFilter === filter.value
                      ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                      : "border-border/70 bg-[hsl(var(--surface-panel))] text-muted-foreground hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </header>
          <ul className="space-y-3 text-sm">
            {filteredDocuments.map((doc) => (
              <li key={doc.id} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">Uploaded {formatDate(doc.createdAt)}</p>
                  </div>
                  <span className="rounded-full border border-border/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    {doc.category}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))]">
                    <Download className="h-3.5 w-3.5" /> {doc.url ? "Download" : "Request copy"}
                  </button>
                  <button className="rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))]">
                    Share securely
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Billing</h2>
          </header>
          <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Outstanding balance</p>
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(outstandingBalance)}</p>
            <p className="text-xs text-muted-foreground">Includes {outstandingInvoices.length} invoice(s)</p>
          </div>
          <div className="grow space-y-3 text-sm">
            {patientInvoices.map((invoice) => (
              <button
                key={invoice.id}
                onClick={() => setSelectedInvoiceId(invoice.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                  selectedInvoice?.id === invoice.id
                    ? "border-primary/40 bg-[hsl(var(--surface-strong))] text-foreground"
                    : "border-border/60 bg-[hsl(var(--surface-interactive))] text-muted-foreground hover:bg-[hsl(var(--surface-panel))]"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{invoice.id}</p>
                  <StatusBadge
                    tone={invoice.status === "paid" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}
                    label={invoice.status}
                  />
                </div>
                <p className="text-xs">{formatDate(invoice.createdAt)} • {formatCurrency(invoice.total)}</p>
              </button>
            ))}
          </div>
          <InvoiceDetail invoice={selectedInvoice} />
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
        <article className="space-y-4 rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Support requests</h2>
          </header>
          <ul className="space-y-3 text-sm">
            {supportTickets.map((ticket) => (
              <li key={ticket.id} className="rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">Opened {formatRelative(ticket.createdAt)}</p>
                  </div>
                  <StatusBadge tone={SUPPORT_STATUS_TONE[ticket.status]} label={ticket.status} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{ticket.message}</p>
                {ticket.respondedAt ? (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Responded {formatRelative(ticket.respondedAt)}
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
                      Add update
                    </button>
                    <button className="rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))]">
                      Close request
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">New ticket</p>
            <p className="mt-2 text-foreground">Submit a non-clinical support query. Our team responds within 1 business day.</p>
            <div className="mt-3 grid gap-2 text-xs">
              <input
                placeholder="Subject"
                className="rounded-lg border border-border/70 bg-[hsl(var(--surface-panel))] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <textarea
                placeholder="Describe your request"
                rows={3}
                className="rounded-lg border border-border/70 bg-[hsl(var(--surface-panel))] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button className="w-full rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
                Submit request
              </button>
            </div>
          </div>
        </article>

        <article className="flex h-full flex-col gap-4 rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Invoice explainer</h2>
            </div>
            <div className="flex items-center gap-2">
              {invoiceAI.isFallback && (
                <span className="text-[11px] text-muted-foreground">Demo mode</span>
              )}
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Gemini draft</span>
            </div>
          </header>
          <div className="rounded-xl border border-border/60 bg-[hsl(var(--surface-panel))] p-4 text-sm text-muted-foreground">
            {invoiceAI.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Generating explanation...</span>
              </div>
            ) : (
              <p>{aiExplanation}</p>
            )}
          </div>
          <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{patientAiDraft.disclaimer}</span>
            <div className="flex gap-2">
              <button
                onClick={handleGenerateExplanation}
                disabled={invoiceAI.loading}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))] disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" /> Regenerate
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(aiExplanation)}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle"
              >
                <Receipt className="h-3.5 w-3.5" /> Copy summary
              </button>
            </div>
          </footer>
        </article>
      </section>

      <footer className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Notifications
          </div>
          <span className="text-xs">appointment.reminder • lab.result.available • payment.receipt-ready • support.response</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Audit log captures patient.login, appointment.cancelled, payment.success, and support.requested events for compliance.
        </p>
      </footer>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
  icon: typeof CalendarClock;
  tone?: string;
};

function MetricCard({ label, value, description, icon: Icon, tone }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-[hsl(var(--surface-panel))] p-5 shadow-[0_20px_44px_-32px_hsl(var(--shadow-soft))]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <Icon className={cn("h-4 w-4", tone ?? "text-primary")} />
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">{description}</p>
    </article>
  );
}

type StatusBadgeProps = {
  tone: string;
  label: string;
};

function StatusBadge({ tone, label }: StatusBadgeProps) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", tone)}>{label.toUpperCase()}</span>
  );
}

type ActionButtonProps = {
  label: string;
  description: string;
};

function ActionButton({ label, description }: ActionButtonProps) {
  return (
    <button className="flex w-full flex-col items-start rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))]">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-xs">{description}</span>
    </button>
  );
}

type InvoiceDetailProps = {
  invoice: Invoice | null | undefined;
};

function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const { initiatePayment, loading: paymentLoading } = usePayment({
    onSuccess: (response) => {
      console.log("Payment successful:", response);
      // In a real app, update invoice status via API
    },
    onError: (error) => {
      console.error("Payment failed:", error);
    },
  });

  const handlePayNow = async () => {
    if (!invoice) return;
    
    await initiatePayment(
      invoice.id,
      invoice.total,
      {
        name: "Current Patient", // In real app, get from auth context
        email: "patient@hospital.com", // In real app, get from auth context
      }
    );
  };

  if (!invoice) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-[hsl(var(--surface-interactive))] p-4 text-sm text-muted-foreground">
        Select an invoice to review line items, balances, and payment options.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-[hsl(var(--surface-interactive))] p-4 text-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{invoice.id}</p>
          <p className="text-xs text-muted-foreground">Created {formatDate(invoice.createdAt)}</p>
        </div>
        <span className="rounded-full border border-border/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          {invoice.status.toUpperCase()}
        </span>
      </header>
      <table className="w-full text-xs text-muted-foreground">
        <tbody className="divide-y divide-border/60">
          {invoice.lines.map((line, index) => (
            <tr key={`${line.desc}-${index}`}>
              <td className="py-2 text-left">{line.desc}</td>
              <td className="py-2 text-right">{line.qty} × {formatCurrency(line.unitPrice)}</td>
              <td className="py-2 text-right">{formatCurrency(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span>{formatCurrency(invoice.tax)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Discounts</span>
          <span>{invoice.discounts ? `- ${formatCurrency(invoice.discounts)}` : formatCurrency(0)}</span>
        </div>
        <div className="flex items-center justify-between text-sm font-semibold text-foreground">
          <span>Total due</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button 
          onClick={handlePayNow}
          disabled={paymentLoading || invoice.status === "paid"}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {paymentLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {paymentLoading ? "Processing..." : invoice.status === "paid" ? "Paid" : "Pay now"}
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-panel))]">
          <Receipt className="h-3.5 w-3.5" /> Download receipt
        </button>
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Payment confirmations trigger payment.success and notify billing instantly.
      </p>
    </div>
  );
}

function formatVisitWindow(appointment: Appointment) {
  const start = formatTime(appointment.startAt);
  const end = appointment.endAt ? formatTime(appointment.endAt) : undefined;
  return end ? `${start} – ${end}` : start;
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(timestamp: string) {
  const now = new Date();
  const target = new Date(timestamp);
  const diffMs = now.getTime() - target.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < 60) {
    return `${Math.abs(minutes)} min ${minutes >= 0 ? "ago" : "from now"}`;
  }
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return `${Math.abs(hours)} hr ${hours >= 0 ? "ago" : "from now"}`;
  }
  const days = Math.round(hours / 24);
  return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ${days >= 0 ? "ago" : "from now"}`;
}
