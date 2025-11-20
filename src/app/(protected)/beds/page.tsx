export default function BedBoardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Bed Board</h1>
        <p className="text-sm text-muted-foreground">
          Upcoming grid view of wards, isolation rooms, and critical care beds with transfer workflows.
        </p>
      </header>

      <section className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Ward occupancy heatmap</p>
        <p className="mt-2 text-xs">
          Interactive layout will use shadcn drawers for patient context and Framer Motion for transitions.
        </p>
      </section>
    </div>
  );
}
