"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, CreditCard, Download, FileText, IndianRupee, Loader2, Receipt, RefreshCw, Sparkles } from "lucide-react";
import { useAI } from "@/hooks/use-ai";
import { cn } from "@/lib/utils";
import { claims, invoices as invoiceSeed, payments as paymentSeed } from "@/mocks/data/billing";
import type { Claim, Invoice, InvoiceStatus, Payment } from "@/types/core";

const STATUS_FILTERS: Array<{ label: string; value: InvoiceStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Refunded", value: "refunded" },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(invoiceSeed);
  const [payments, setPayments] = useState<Payment[]>(paymentSeed);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(invoices[0]?.id ?? null);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [invoiceExplanation, setInvoiceExplanation] = useState("");
  const [invoiceContext, setInvoiceContext] = useState<Record<string, unknown>>({});

  const filteredInvoices = useMemo(() => {
    if (statusFilter === "ALL") return invoices;
    return invoices.filter((invoice) => invoice.status === statusFilter);
  }, [invoices, statusFilter]);

  const selectedInvoice = useMemo(
    () => filteredInvoices.find((invoice) => invoice.id === selectedInvoiceId) ?? filteredInvoices[0],
    [filteredInvoices, selectedInvoiceId]
  );

  useEffect(() => {
    if (selectedInvoice) {
      setInvoiceContext({
        invoiceId: selectedInvoice.id,
        patientId: selectedInvoice.patientId,
        totalAmount: selectedInvoice.total,
        items: selectedInvoice.lines.map(line => `${line.desc} (${line.qty} × ₹${line.unitPrice})`).join(", "),
        subtotal: selectedInvoice.subtotal,
        tax: selectedInvoice.tax,
        discounts: selectedInvoice.discounts,
      });
    }
  }, [selectedInvoice]);

  const invoiceAI = useAI({
    type: "invoice-explanation",
    context: invoiceContext,
  });

  useEffect(() => {
    if (invoiceAI.text) {
      setInvoiceExplanation(invoiceAI.text);
      setShowAiSummary(true);
    }
  }, [invoiceAI.text]);

  const handleGenerateExplanation = async () => {
    if (!selectedInvoice) return;
    await invoiceAI.generate();
  };

  const relatedPayments = useMemo(() => {
    if (!selectedInvoice) return [];
    return payments.filter((payment) => payment.invoiceId === selectedInvoice.id);
  }, [payments, selectedInvoice]);

  const activeClaim: Claim | undefined = useMemo(() => {
    if (!selectedInvoice) return undefined;
    return claims.find((claim) => claim.invoiceId === selectedInvoice.id);
  }, [selectedInvoice]);

  const metrics = useMemo(() => {
    const collected = payments
      .filter((payment) => payment.status === "succeeded")
      .reduce((acc, payment) => acc + payment.amount, 0);
    const outstanding = invoices
      .filter((invoice) => invoice.status === "unpaid")
      .reduce((acc, invoice) => acc + invoice.total, 0);
    const pendingClaims = claims.filter((claim) => claim.status !== "approved").length;
    return {
      collected,
      outstanding,
      pendingClaims,
    };
  }, [payments, invoices]);

  function markInvoiceAsPaid(invoiceId: string) {
    const invoice = invoices.find((item) => item.id === invoiceId);
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === invoiceId
          ? {
              ...item,
              status: "paid",
            }
          : item
      )
    );
    if (!invoice) return;
    setPayments((prev) => [
      ...prev,
      {
        id: `PAY-${Math.floor(Math.random() * 9000) + 1000}`,
        invoiceId,
        amount: invoice.total,
        method: "Card",
        paymentRef: `TXN-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        status: "succeeded",
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Revenue cockpit</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Billing & payments</h1>
            <p className="text-sm text-muted-foreground">
              Track invoices, claims, and payment flows with instant AI explainers and audit-ready history.
            </p>
          </div>
          <button
            onClick={handleGenerateExplanation}
            disabled={invoiceAI.loading || !selectedInvoice}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {invoiceAI.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {invoiceAI.loading ? "Generating..." : "Explain invoice with Gemini"}
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard
          title="Collections today"
          value={`₹${metrics.collected.toLocaleString("en-IN")}`}
          description="Includes successful UPI/Card/Insurance payments"
        />
        <MetricCard
          title="Outstanding amount"
          value={`₹${metrics.outstanding.toLocaleString("en-IN")}`}
          description="Unpaid invoices awaiting settlement"
        />
        <MetricCard
          title="Open claims"
          value={`${metrics.pendingClaims}`}
          description="Pending insurer adjudication"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <article className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-medium transition-colors",
                    statusFilter === filter.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Invoice</th>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/40",
                      selectedInvoice?.id === invoice.id ? "bg-primary/5" : undefined
                    )}
                    onClick={() => setSelectedInvoiceId(invoice.id)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{invoice.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{invoice.patientId}</td>
                    <td className="px-4 py-3 text-foreground">₹{invoice.total.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(invoice.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          {selectedInvoice ? (
            <InvoiceDetail
              invoice={selectedInvoice}
              payments={relatedPayments}
              claim={activeClaim}
              onMarkPaid={markInvoiceAsPaid}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
              Select an invoice to inspect lines, payments, and claim status.
            </div>
          )}
        </article>
      </section>

      {showAiSummary ? (
        <article className="space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-subtle">
          <header className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Gemini invoice explainer</h2>
            </div>
            <button
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setShowAiSummary(false)}
            >
              Dismiss
            </button>
          </header>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Informational draft — finance team must review before sharing with patient.
          </p>
          <div className="space-y-2 rounded-xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
            <p className="text-foreground">Summary</p>
            <p>
              This invoice covers today’s oncology review (₹1,200), chemotherapy chair usage (₹4,500), and liver function test (₹550). Taxes (₹750) are applied as per GST 12%. Total due ₹7,000, of which insurer will cover ₹5,600 based on plan co-pay.
            </p>
            <p className="text-foreground">Next steps</p>
            <ul className="list-inside list-disc">
              <li>Collect patient co-pay of ₹1,400 at discharge desk.</li>
              <li>Submit remaining amount to insurer with chemo cycle documentation.</li>
            </ul>
          </div>
          <div className="flex gap-2 text-xs">
            <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-subtle">
              Copy summary
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

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
};

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card/80 p-5 shadow-subtle">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">{description}</p>
    </article>
  );
}

type InvoiceDetailProps = {
  invoice: Invoice;
  payments: Payment[];
  claim?: Claim;
  onMarkPaid: (invoiceId: string) => void;
};

function InvoiceDetail({ invoice, payments, claim, onMarkPaid }: InvoiceDetailProps) {
  return (
    <div className="space-y-4 text-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Invoice detail</p>
          <h2 className="text-lg font-semibold text-foreground">{invoice.id}</h2>
          <p className="text-xs text-muted-foreground">Created {formatDate(invoice.createdAt)}</p>
        </div>
        <StatusPill status={invoice.status} />
      </header>

      <div className="space-y-2 rounded-xl border border-border/70 bg-background p-4">
        <h3 className="text-sm font-semibold text-foreground">Line items</h3>
        <ul className="space-y-2">
          {invoice.lines.map((line) => (
            <li key={`${line.code}-${line.desc}`} className="flex items-center justify-between text-xs">
              <div>
                <p className="font-medium text-foreground">{line.desc}</p>
                <p className="text-muted-foreground">
                  {line.code ?? "--"} • Qty {line.qty} × ₹{line.unitPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <span className="text-foreground">₹{line.amount.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <p>Subtotal ₹{invoice.subtotal.toLocaleString("en-IN")}</p>
          <p>Tax ₹{invoice.tax.toLocaleString("en-IN")}</p>
          <p>Discounts ₹{invoice.discounts.toLocaleString("en-IN")}</p>
          <p className="text-sm font-semibold text-foreground">Total ₹{invoice.total.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Payments</h3>
          <button className="inline-flex items-center gap-1 text-xs text-primary">
            <Download className="h-3.5 w-3.5" /> Download receipt
          </button>
        </div>
        {payments.length ? (
          <ul className="space-y-2 text-xs text-muted-foreground">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between">
                <span>
                  {payment.method} • {formatTime(payment.createdAt)}
                </span>
                <span>
                  ₹{payment.amount.toLocaleString("en-IN")} ({payment.status})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
        )}
        {invoice.status !== "paid" ? (
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5"
            onClick={() => onMarkPaid(invoice.id)}
          >
            <IndianRupee className="h-3.5 w-3.5" /> Mark as paid
          </button>
        ) : null}
      </div>

      <div className="space-y-3 rounded-xl border border-border/70 bg-background p-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Claim status</h3>
          <button className="inline-flex items-center gap-1 text-primary">
            <FileText className="h-3.5 w-3.5" /> View claim note
          </button>
        </div>
        {claim ? (
          <div className="space-y-1">
            <p>Insurer • {claim.insurer}</p>
            <p>Policy • {claim.policyNo}</p>
            <p>Status • {claim.status.toUpperCase()}</p>
            <p>Submitted • {formatDate(claim.submittedAt)}</p>
            {claim.adjudicatedAt ? <p>Adjudicated • {formatDate(claim.adjudicatedAt)}</p> : null}
          </div>
        ) : (
          <p>No claim on file. Trigger submission if insurance payer applies.</p>
        )}
      </div>
    </div>
  );
}

type StatusPillProps = {
  status: InvoiceStatus;
};

function StatusPill({ status }: StatusPillProps) {
  const styles: Record<InvoiceStatus, string> = {
    paid: "bg-primary/10 text-primary",
    unpaid: "bg-destructive/10 text-destructive",
    pending: "bg-secondary/15 text-secondary",
    refunded: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", styles[status])}>
      {status.toUpperCase()}
    </span>
  );
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
