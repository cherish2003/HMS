import { billingRules, holidayCalendar, paymentGateways } from "@/mocks/data/admin";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Billing configuration</h2>
            <p className="text-xs text-muted-foreground">
              Base rules that feed into invoicing and collection flows.
            </p>
          </div>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
            Edit rules
          </button>
        </header>
        <ul className="mt-4 space-y-3 text-sm">
          {billingRules.map((rule) => (
            <li key={rule.id} className="rounded-xl border border-border/70 bg-background p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{rule.description}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  {rule.value}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Payment gateway integrations</h2>
            <p className="text-xs text-muted-foreground">
              Track gateway connectivity status and last sync timestamps.
            </p>
          </div>
          <button className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            Manage connections
          </button>
        </header>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {paymentGateways.map((gateway) => (
            <article key={gateway.id} className="rounded-xl border border-border/70 bg-background p-4 text-sm">
              <p className="font-semibold text-foreground">{gateway.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">Status: {gateway.status}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Last synced {formatDate(gateway.lastSyncedAt)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Holiday calendar</h2>
            <p className="text-xs text-muted-foreground">
              Maintain campus-specific holiday lists for staffing and scheduling automation.
            </p>
          </div>
          <button className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            Update calendar
          </button>
        </header>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
          <table className="min-w-full divide-y divide-border/70 text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Occasion</th>
                <th className="px-4 py-3 text-left">Campuses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {holidayCalendar.map((holiday) => (
                <tr key={holiday.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(holiday.date)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{holiday.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{holiday.campuses.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Audit trail</p>
        <p className="mt-2">
          Every change here emits `settings.changed` audit events. Surface them in the audit log viewer for Super Admin review.
        </p>
      </section>
    </div>
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
