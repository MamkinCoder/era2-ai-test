import { useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useQueue,
  toViewModel,
  getStats,
  filterTasks,
  sortTasks,
  QueueStats,
  QueueToolbar,
  TaskCard,
  TaskRow,
  EmptyState,
  LoadingState,
  ErrorState,
} from "@/features/generation-queue";
import type { QueueStatusFilter, QueueSortMode } from "@/features/generation-queue";

type InitStatus = "loading" | "ready" | "error";

function simulateInit(): Promise<void> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (Math.random() < 0.05 ? reject() : resolve()), 600),
  );
}

const UNDO_DELAY_MS = 5000;

const taskVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function QueueHeader({
  onClearCompleted,
  canClearCompleted,
}: {
  onClearCompleted: () => void;
  canClearCompleted: boolean;
}) {
  const [undoActive, setUndoActive] = useState(false);
  const [remaining, setRemaining] = useState(UNDO_DELAY_MS / 1000);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimers() {
    if (commitTimer.current) { clearTimeout(commitTimer.current); commitTimer.current = null; }
    if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null; }
  }

  function handleClear() {
    if (undoActive) return;
    setUndoActive(true);
    setRemaining(UNDO_DELAY_MS / 1000);
    commitTimer.current = setTimeout(() => {
      onClearCompleted();
      setUndoActive(false);
    }, UNDO_DELAY_MS);
    tickTimer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(tickTimer.current!); tickTimer.current = null; return 0; }
        return r - 1;
      });
    }, 1000);
  }

  function handleUndo() {
    clearTimers();
    setUndoActive(false);
  }

  useEffect(() => clearTimers, []);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[26px] md:text-[30px] font-bold leading-[1.3] text-[var(--c-fg)]">
          Очередь генераций
        </h1>
        <p className="mt-1 text-[14px] md:text-[15px] text-[var(--c-fg-mute)]">
          Все ваши задачи в реальном времени
        </p>
      </div>
      <div className="flex items-center gap-3 self-start md:self-auto">
        {undoActive ? (
          <div className="flex items-center gap-3 h-10 px-4 rounded-full bg-[var(--c-bg-2)] border border-[#2d2420] text-[13px]">
            <span className="text-[var(--c-fg-mute)]">Готовые удалятся через {remaining}с</span>
            <button
              onClick={handleUndo}
              className="text-[var(--c-accent-2)] font-medium hover:opacity-80 transition-opacity"
            >
              Отменить
            </button>
          </div>
        ) : (
          <button
            onClick={handleClear}
            disabled={!canClearCompleted}
            className="h-10 px-4 text-[14px] font-medium text-[var(--c-fg-dim)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Очистить готовые
          </button>
        )}
      </div>
    </div>
  );
}

export function GenerationQueue() {
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

  const viewModels = useMemo(
    () => tasks.map((t) => toViewModel(t, queuedIds)),
    [tasks, queuedIds],
  );

  const stats = useMemo(() => getStats(tasks), [tasks]);

  const sorted = useMemo(
    () => sortTasks(filterTasks(viewModels, statusFilter, search), sortMode),
    [viewModels, statusFilter, search, sortMode],
  );

  if (initStatus === "loading") return <LoadingState />;

  if (initStatus === "error") {
    return (
      <ErrorState
        onRetry={() => {
          setInitStatus("loading");
          simulateInit()
            .then(() => setInitStatus("ready"))
            .catch(() => setInitStatus("error"));
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <QueueHeader
        onClearCompleted={clearCompleted}
        canClearCompleted={stats.done > 0}
      />
      <QueueStats {...stats} />
      <QueueToolbar
        status={statusFilter}
        sort={sortMode}
        search={search}
        onStatusChange={setStatusFilter}
        onSortChange={setSortMode}
        onSearchChange={setSearch}
      />
      {sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-[10px]">
          <AnimatePresence initial={false}>
            {sorted.map((task) => (
              <motion.div
                key={task.id}
                layout
                variants={taskVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.18 }}
              >
                <div className="md:hidden">
                  <TaskCard task={task} onCancel={cancel} onRetry={retry} onDelete={deleteTask} />
                </div>
                <div className="hidden md:block">
                  <TaskRow task={task} onCancel={cancel} onRetry={retry} onDelete={deleteTask} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
