import { adminUsers, hospitals } from "@/mocks/data/admin";

const STATUS_STYLES: Record<string, string> = {
  active: "rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary",
  trial: "rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-semibold text-secondary",
  expired: "rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-semibold text-destructive",
};

export default function AdminHospitalsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Hospital tenancy</h2>
            <p className="text-xs text-muted-foreground">
              Manage campuses, assign local administrators, and monitor subscription status.
            </p>
          </div>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
            Add hospital
          </button>
        </header>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
          <table className="min-w-full divide-y divide-border/70 text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Hospital</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Beds</th>
                <th className="px-4 py-3 text-left">Admins</th>
                <th className="px-4 py-3 text-left">Subscription</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {hospitals.map((hospital) => (
                <tr key={hospital.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-foreground">{hospital.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{hospital.location}</td>
                  <td className="px-4 py-3 text-muted-foreground">{hospital.beds}</td>
                  <td className="px-4 py-3 text-muted-foreground">{renderAdmins(hospital.admins)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className={STATUS_STYLES[hospital.subscriptionStatus] ?? STATUS_STYLES.active}>
                      {hospital.subscriptionStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-primary">
                    <button className="mr-3 underline-offset-2 hover:underline">Manage</button>
                    <button className="underline-offset-2 hover:underline">Audit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Subscription insights</p>
        <p className="mt-2">
          Upgrade expiring tenants proactively. Trigger `subscription.expiring` notifications 30 days before expiry for Super Admin follow-up.
        </p>
      </section>
    </div>
  );
}

function renderAdmins(adminIds: string[]) {
  if (!adminIds.length) {
    return "No admins assigned";
  }

  const names = adminIds
    .map((id) => adminUsers.find((user) => user.id === id)?.name)
    .filter(Boolean);

  return names.join(", ");
}
