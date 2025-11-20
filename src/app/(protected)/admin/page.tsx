import { auditEvents, adminUsers, departments, hospitals, tariffs, testCatalog } from "@/mocks/data/admin";

const OVERVIEW_METRICS = [
  {
    label: "Active administrators",
    value: adminUsers.filter((user) => user.status === "active").length.toString(),
    description: "Across hospitals in the Medstar network",
  },
  {
    label: "Hospitals managed",
    value: hospitals.length.toString(),
    description: "Multi-campus footprint with tenancy",
  },
  {
    label: "Master data entities",
    value: (departments.length + testCatalog.length + tariffs.length).toString(),
    description: "Departments, catalog entries, and tariffs",
  },
];

export default function AdminOverviewPage() {
  const latestAudits = auditEvents.slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {OVERVIEW_METRICS.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-border bg-card/80 p-5 shadow-subtle"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-4 text-3xl font-semibold text-foreground">{metric.value}</p>
            <p className="mt-3 text-xs text-muted-foreground">{metric.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
        <article className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Master data snapshot</h2>
              <p className="text-xs text-muted-foreground">
                Keep departments, test catalog, and tariffs in sync across campuses.
              </p>
            </div>
            <button className="text-xs font-medium text-primary">Open master data</button>
          </header>
          <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Departments</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{departments.length}</p>
              <p className="mt-1">{departments.filter((dept) => dept.active).length} active</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Test catalog</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{testCatalog.length}</p>
              <p className="mt-1">Median TAT {medianTat(testCatalog)} hrs</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tariffs</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{tariffs.length}</p>
              <p className="mt-1">{tariffs.filter((tariff) => tariff.active).length} active price rules</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent admin activity</h2>
            <button className="text-xs font-medium text-primary">Open audit log</button>
          </header>
          <ul className="mt-4 space-y-3 text-sm">
            {latestAudits.map((event) => (
              <li key={event.id} className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{event.action}</div>
                <div className="mt-1 font-medium text-foreground">{event.entityType.toUpperCase()} · {event.entityId}</div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDate(event.timestamp)}</div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6 text-sm text-muted-foreground">
        <p className="text-sm font-medium text-foreground">AI assistance spotlight</p>
        <p className="mt-2 text-xs">
          Use Gemini to prepare monthly usage summaries and policy updates. Outputs remain drafts until a human administrator approves them.
        </p>
      </section>
    </div>
  );
}

function medianTat(catalog: typeof testCatalog) {
  const sorted = [...catalog].map((entry) => entry.tatHours).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1);
  }
  return sorted[mid].toString();
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    hour12: false,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
