export function DeskCard({ name, live = false }: { name: string; live?: boolean }) {
  return (
    <div className="desk-card">
      <strong data-name-output={live || undefined}>{name}</strong>
      <small>ajigu</small>
    </div>
  );
}
