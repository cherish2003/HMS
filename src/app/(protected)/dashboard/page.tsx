const KPI_CARDS = [
  {
    label: "Total Patients Today",
    value: "1,248",
    delta: "+12.4% vs last week",
  },
  {
    label: "Bed Occupancy",
    value: "87%",
    delta: "12 beds available",
  },
  {
    label: "Revenue (Today)",
    value: "₹46.2L",
    delta: "+6.8% vs forecast",
  },
];

const ALERTS = [
  {
    title: "ICU reaching capacity",
    description: "89% occupancy, 2 ventilators under maintenance.",
  },
  {
    title: "Pending discharge summaries",
    description: "12 drafts awaiting clinician review.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Super Admin Overview
        </p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Evening pulse • Medstar Hospitals Network
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time operations, billing, and quality metrics across tier-1 campuses.
            </p>
          </div>
          <button className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/15">
            View AI Digest
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {KPI_CARDS.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-border bg-card/80 p-5 shadow-subtle"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-primary">{card.delta}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <article className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Admissions Trend
              </h2>
              <p className="text-xs text-muted-foreground">
                14-day moving average of OPD vs IPD admissions across campuses.
              </p>
            </div>
            <button className="text-xs font-medium text-primary">
              View analytics
            </button>
          </header>
          <div className="mt-8 flex h-48 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/60 text-xs text-muted-foreground">
            Recharts line visualization placeholder
          </div>
        </article>

        <article className="space-y-3 rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
            <span className="rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
              {ALERTS.length} active
            </span>
          </header>
          <ul className="space-y-4">
            {ALERTS.map((alert) => (
              <li key={alert.title} className="rounded-xl border border-border/80 bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {alert.description}
                </p>
              </li>
            ))}
          </ul>
          <button className="w-full rounded-lg border border-muted-foreground/20 bg-muted/60 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
            Open operations center
          </button>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Gemini-powered insight summary tailored to Medstar protocols.
              </p>
            </div>
            <span className="text-[11px] font-medium text-primary">Streaming demo</span>
          </header>
          <div className="mt-4 space-y-3 text-sm">
            <p className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-primary">
              “ICU utilization will cross 93% by 8pm. Suggested action: divert non-critical
              admissions to Royal Pavilion campus.”
            </p>
            <p className="text-xs text-muted-foreground">
              Response generated in 2.8 seconds • Review required before clinical action.
            </p>
            <div className="flex gap-2">
              <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5">
                Open AI workspace
              </button>
              <button className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
                Prompt library
              </button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Billing Performance</h2>
              <p className="text-xs text-muted-foreground">
                Insurance claims and payment funnel status across the network.
              </p>
            </div>
            <button className="text-xs font-medium text-primary">View billing</button>
          </header>
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <p className="font-medium text-foreground">Claims approved</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">74%</p>
              <p className="mt-1">32 pending review</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <p className="font-medium text-foreground">Collections</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">₹3.2Cr</p>
              <p className="mt-1">+9.2% from last month</p>
            </div>
            <div className="col-span-2 rounded-xl border border-dashed border-border/80 bg-muted/50 p-4 text-center">
              Razorpay-style payment simulation coming soon.
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
