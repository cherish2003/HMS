import { departments, tariffs, testCatalog } from "@/mocks/data/admin";

export default function MasterDataPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Departments</h2>
            <p className="text-xs text-muted-foreground">
              Manage specialties and departmental ownership across campuses.
            </p>
          </div>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
            Add department
          </button>
        </header>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
          <table className="min-w-full divide-y divide-border/70 text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Specialty</th>
                <th className="px-4 py-3 text-left">Head</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-foreground">{dept.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dept.specialty}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dept.head ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span
                      className={dept.active ? "rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary" : "rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground"}
                    >
                      {dept.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Test catalog</h2>
            <p className="text-xs text-muted-foreground">
              Diagnostics catalogue with turnaround time and pricing.
            </p>
          </div>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
            Add test
          </button>
        </header>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
          <table className="min-w-full divide-y divide-border/70 text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Test</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">TAT (hrs)</th>
                <th className="px-4 py-3 text-left">Price ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {testCatalog.map((test) => (
                <tr key={test.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 text-muted-foreground">{test.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{test.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{resolveDepartment(test.departmentId)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{test.tatHours}</td>
                  <td className="px-4 py-3 text-muted-foreground">₹{test.price.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tariffs & pricing</h2>
            <p className="text-xs text-muted-foreground">
              Configure procedure, room, diagnostic, and pharmacy price rules.
            </p>
          </div>
          <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
            Add tariff
          </button>
        </header>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
          <table className="min-w-full divide-y divide-border/70 text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Base price</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {tariffs.map((tariff) => (
                <tr key={tariff.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 text-muted-foreground">{tariff.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{tariff.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tariff.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">₹{tariff.basePrice.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span
                      className={tariff.active ? "rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary" : "rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground"}
                    >
                      {tariff.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function resolveDepartment(departmentId: string) {
  const match = departments.find((dept) => dept.id === departmentId);
  return match ? match.name : departmentId;
}
