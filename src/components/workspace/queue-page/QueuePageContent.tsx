import { useState, useMemo } from "react";
import { useQueue } from "@/entities/generation/model/queue-context";
import { TICK_SPEED, MODEL_NAMES, CREDITS } from "@/entities/generation/model/queue-types";
import type { GenerationType } from "@/entities/generation/model/queue-types";
import { QueuePageHeader } from "./QueuePageHeader";
import { QueueStatsGrid } from "./QueueStatsGrid";
import { QueueToolbar } from "./QueueToolbar";
import { QueueTaskList } from "./QueueTaskList";
import type { QueueStatusFilter, QueueSortMode, QueueTaskViewModel } from "./queue-page.types";

/** Total seconds to go from 0→100 progress for each type, derived from TICK_SPEED (500ms/tick) */
function totalDurationSec(type: GenerationType): number {
  return (100 / TICK_SPEED[type]) * 0.5;
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} сек`;
  return `${Math.floor(sec / 60)} мин ${sec % 60} сек`;
}

const STATUS_ORDER: Record<string, number> = {
  running: 0,
  queued: 1,
  failed: 2,
  done: 3,
  cancelled: 4,
};

export function QueuePageContent() {
  const { tasks, cancel, retry, clearCompleted } = useQueue();
  const [statusFilter, setStatusFilter] = useState<QueueStatusFilter>("all");
  const [sortMode, setSortMode] = useState<QueueSortMode>("activeFirst");

  // Map raw QueueTask → QueueTaskViewModel
  const queuedIds = useMemo(
    () => tasks.filter((t) => t.status === "queued").map((t) => t.id),
    [tasks],
  );

  const viewModels = useMemo<QueueTaskViewModel[]>(() => {
    return tasks.map((task) => {
      const queuePosition =
        task.status === "queued" ? queuedIds.indexOf(task.id) + 1 : undefined;
      const remaining = Math.round(
        ((100 - task.progress) / 100) * totalDurationSec(task.type as GenerationType),
      );
      let durationLabel: string | undefined;
      if (task.status === "running") {
        durationLabel = `≈ ${formatDuration(remaining)}`;
      } else if (task.status === "done" && task.startedAt && task.finishedAt) {
        const elapsed = Math.round((task.finishedAt - task.startedAt) / 1000);
        durationLabel = `готово за ${formatDuration(elapsed)}`;
      }
      return {
        id: task.id,
        type: task.type as QueueTaskViewModel["type"],
        status: task.status,
        prompt: task.prompt,
        modelName: MODEL_NAMES[task.type as GenerationType],
        credits: CREDITS[task.type as GenerationType],
        progress: task.progress,
        createdAt: new Date(task.createdAt),
        durationLabel,
        queuePosition,
        errorMessage: task.errorMessage,
      };
    });
  }, [tasks, queuedIds]);

  // Stats from full list
  const stats = useMemo(
    () => ({
      queued: tasks.filter((t) => t.status === "queued").length,
      running: tasks.filter((t) => t.status === "running").length,
      done: tasks.filter((t) => t.status === "done").length,
      failed: tasks.filter((t) => t.status === "failed").length,
    }),
    [tasks],
  );

  // Filter
  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? viewModels
        : viewModels.filter((t) => t.status === statusFilter),
    [viewModels, statusFilter],
  );

  // Sort
  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortMode === "newest") return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (sortMode === "oldest") return copy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    // activeFirst
    return copy.sort(
      (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
    );
  }, [filtered, sortMode]);

  return (
    <div className="flex flex-col gap-6">
      <QueuePageHeader
        onClearCompleted={clearCompleted}
        canClearCompleted={stats.done > 0}
      />
      <QueueStatsGrid {...stats} />
      <QueueToolbar
        status={statusFilter}
        sort={sortMode}
        onStatusChange={setStatusFilter}
        onSortChange={setSortMode}
      />
      <QueueTaskList tasks={sorted} onCancel={cancel} onRetry={retry} />
    </div>
  );
}
