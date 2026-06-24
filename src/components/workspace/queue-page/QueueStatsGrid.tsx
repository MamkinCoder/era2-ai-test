import { QueueStatCard } from "./QueueStatCard";

export interface QueueStatsGridProps {
  queued: number;
  running: number;
  done: number;
  failed: number;
}

export function QueueStatsGrid({ queued, running, done, failed }: QueueStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-3">
      <QueueStatCard label="В очереди" count={queued} tone="muted" />
      <QueueStatCard label="Идёт" count={running} tone="accent" />
      <QueueStatCard label="Готово" count={done} tone="success" />
      <QueueStatCard label="Ошибка" count={failed} tone="danger" />
    </div>
  );
}
