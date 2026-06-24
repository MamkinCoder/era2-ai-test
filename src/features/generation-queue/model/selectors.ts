import type { QueueTask, GenerationType } from "@/entities/generation-task";
import { TICK_SPEED, MODEL_NAMES, CREDITS } from "@/entities/generation-task";
import { formatDuration } from "../lib/formatEta";

export type QueueStatusFilter = "all" | "queued" | "running" | "done" | "failed";
export type QueueSortMode = "newest" | "oldest" | "activeFirst";

export interface QueueTaskViewModel {
  id: string;
  type: GenerationType;
  status: QueueTask["status"];
  prompt: string;
  modelName: string;
  credits: number;
  progress: number;
  createdAt: Date;
  durationLabel?: string;
  queuePosition?: number;
  errorMessage?: string;
}

export interface QueueStats {
  queued: number;
  running: number;
  done: number;
  failed: number;
}

const STATUS_ORDER: Record<string, number> = {
  running: 0,
  queued: 1,
  failed: 2,
  done: 3,
  cancelled: 4,
};

function totalDurationSec(type: GenerationType): number {
  return (100 / TICK_SPEED[type]) * 0.5;
}

export function toViewModel(task: QueueTask, queuedIds: string[]): QueueTaskViewModel {
  const queuePosition = task.status === "queued" ? queuedIds.indexOf(task.id) + 1 : undefined;
  const remaining = Math.round(((100 - task.progress) / 100) * totalDurationSec(task.type));
  let durationLabel: string | undefined;
  if (task.status === "running") {
    durationLabel = `≈ ${formatDuration(remaining)}`;
  } else if (task.status === "done" && task.startedAt && task.finishedAt) {
    const elapsed = Math.round((task.finishedAt - task.startedAt) / 1000);
    durationLabel = `готово за ${formatDuration(elapsed)}`;
  }
  return {
    id: task.id,
    type: task.type,
    status: task.status,
    prompt: task.prompt,
    modelName: MODEL_NAMES[task.type],
    credits: CREDITS[task.type],
    progress: task.progress,
    createdAt: new Date(task.createdAt),
    durationLabel,
    queuePosition,
    errorMessage: task.errorMessage,
  };
}

export function getStats(tasks: QueueTask[]): QueueStats {
  return {
    queued: tasks.filter((t) => t.status === "queued").length,
    running: tasks.filter((t) => t.status === "running").length,
    done: tasks.filter((t) => t.status === "done").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };
}

export function filterTasks(
  tasks: QueueTaskViewModel[],
  filter: QueueStatusFilter,
  search: string,
): QueueTaskViewModel[] {
  let list = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((t) => t.prompt.toLowerCase().includes(q));
  }
  return list;
}

export function sortTasks(tasks: QueueTaskViewModel[], mode: QueueSortMode): QueueTaskViewModel[] {
  const copy = [...tasks];
  if (mode === "newest") return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (mode === "oldest") return copy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return copy.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
}
