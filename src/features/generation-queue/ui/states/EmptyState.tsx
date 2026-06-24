export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[var(--c-line)] py-16 text-center">
      <span className="text-2xl">◌</span>
      <p className="text-sm text-[var(--c-fg-mute)]">Нет задач</p>
    </div>
  );
}
