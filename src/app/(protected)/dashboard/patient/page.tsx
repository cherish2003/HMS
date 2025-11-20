export default function PatientDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Patient portal</h1>
        <p className="text-sm text-muted-foreground">
          Self-service view for Medstar caregivers to check appointments, bills, and labs.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Upcoming appointments
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="rounded-xl border border-border/60 bg-background px-3 py-3">
              21 Nov • 10:30 • Dr. Kavya Desai • Oncology follow-up
            </li>
            <li className="rounded-xl border border-border/60 bg-background px-3 py-3">
              05 Dec • 09:00 • Lab sample collection • Royal Pavilion campus
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Outstanding bills
          </p>
          <p className="mt-4 text-3xl font-semibold text-foreground">₹8,450</p>
          <button className="mt-4 rounded-lg border border-primary/50 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-subtle">
            Pay now (mock)
          </button>
        </div>
      </section>
    </div>
  );
}
