import { useState, useMemo, useEffect } from "react";
import { useQueue } from "@/entities/generation/model/queue-context";
import { TICK_SPEED, MODEL_NAMES, CREDITS } from "@/entities/generation/model/queue-types";
import type { GenerationType } from "@/entities/generation/model/queue-types";
import { QueuePageHeader } from "./QueuePageHeader";
import { QueueStatsGrid } from "./QueueStatsGrid";
import { QueueToolbar } from "./QueueToolbar";
import { QueueTaskList } from "./QueueTaskList";
import type { QueueStatusFilter, QueueSortMode, QueueTaskViewModel } from "./queue-page.types";

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

type InitStatus = "loading" | "ready" | "error";

function simulateInit(): Promise<void> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (Math.random() < 0.05 ? reject() : resolve()), 600),
  );
}

export function QueuePageContent() {
  const { tasks, cancel, retry, deleteTask, clearCompleted } = useQueue();
  const [initStatus, setInitStatus] = useState<InitStatus>("loading");
  const [statusFilter, setStatusFilter] = useState<QueueStatusFilter>("all");
  const [sortMode, setSortMode] = useState<QueueSortMode>("activeFirst");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setInitStatus("loading");
    simulateInit()
      .then(() => { if (!cancelled) setInitStatus("ready"); })
      .catch(() => { if (!cancelled) setInitStatus("error"); });
    return () => { cancelled = true; };
  }, []);

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

  const stats = useMemo(
    () => ({
      queued: tasks.filter((t) => t.status === "queued").length,
      running: tasks.filter((t) => t.status === "running").length,
      done: tasks.filter((t) => t.status === "done").length,
      failed: tasks.filter((t) => t.status === "failed").length,
    }),
    [tasks],
  );

  const filtered = useMemo(() => {
    let list = statusFilter === "all" ? viewModels : viewModels.filter((t) => t.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.prompt.toLowerCase().includes(q));
    }
    return list;
  }, [viewModels, statusFilter, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortMode === "newest") return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (sortMode === "oldest") return copy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return copy.sort(
      (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
    );
  }, [filtered, sortMode]);

  if (initStatus === "loading") {
    return (
      <div className="flex flex-col gap-6">
        {/* skeleton header */}
        <div className="h-[68px] rounded-[16px] bg-[var(--c-bg-2)] animate-pulse" />
        {/* skeleton stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[82px] md:h-[94px] rounded-[16px] bg-[var(--c-bg-2)] animate-pulse" />
          ))}
        </div>
        {/* skeleton rows */}
        <div className="flex flex-col gap-[10px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[88px] rounded-[16px] bg-[var(--c-bg-2)] animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      </div>
    );
  }

  if (initStatus === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="text-3xl">⚠</span>
        <p className="text-[15px] font-medium text-[var(--c-fg)]">Не удалось загрузить очередь</p>
        <p className="text-[13px] text-[var(--c-fg-mute)]">Проверьте соединение и попробуйте снова</p>
        <button
          onClick={() => {
            setInitStatus("loading");
            simulateInit()
              .then(() => setInitStatus("ready"))
              .catch(() => setInitStatus("error"));
          }}
          className="mt-2 h-[38px] px-5 rounded-full bg-[var(--c-accent)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          Повторить
        </button>
      </div>
    );
  }

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
        search={search}
        onStatusChange={setStatusFilter}
        onSortChange={setSortMode}
        onSearchChange={setSearch}
      />
      <QueueTaskList tasks={sorted} onCancel={cancel} onRetry={retry} onDelete={deleteTask} />
    </div>
  );
}
