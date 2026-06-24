import { motion } from "framer-motion";
import { QueueTaskActions } from "./QueueTaskActions";
import { QueueTaskMeta } from "./QueueTaskMeta";
import type { QueueTaskViewModel } from "./queue-page.types";

export interface QueueTaskCardProps {
  task: QueueTaskViewModel;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const VISUAL_TYPES = new Set(["image", "video", "design"]);

const TYPE_ICON: Record<string, string> = {
  text: "💬",
  image: "◐",
  video: "▷",
  audio: "♫",
  design: "◐",
};

const BADGE: Record<string, { label: string; bg: string; color: string }> = {
  running: {
    label: "Идёт",
    bg: "var(--c-accent-soft)",
    color: "var(--c-accent-2)",
  },
  queued: {
    label: "В очереди",
    bg: "var(--c-bg-2)",
    color: "var(--c-fg-mute)",
  },
  done: { label: "Готово", bg: "rgba(16,185,129,0.13)", color: "#34D399" },
  failed: { label: "Ошибка", bg: "rgba(255,90,90,0.12)", color: "#FF6B6B" },
  cancelled: {
    label: "Отменено",
    bg: "var(--c-bg-2)",
    color: "var(--c-fg-low)",
  },
};

function StatusBadge({ status }: { status: string }) {
  const b = BADGE[status];
  if (!b) return null;
  return (
    <span
      className="flex items-center h-[26px] px-2.5 text-[12px] font-medium whitespace-nowrap rounded-[8px]"
      style={{ background: b.bg, color: b.color }}
    >
      {b.label}
    </span>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-[5px] w-full overflow-hidden rounded-full bg-[var(--c-bg-3)]">
      <motion.div
        className="h-full rounded-full bg-[linear-gradient(135deg,var(--c-accent),var(--c-accent-2))]"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: "linear" }}
      />
    </div>
  );
}

function cardBorder(status: string) {
  if (status === "running") return "border border-[rgba(232,84,32,0.35)]";
  return "border border-[#2d2420]";
}

function TaskIconDesktop({ type }: { type: string }) {
  return (
    <div
      className="w-14 h-14 shrink-0 rounded-[12px] flex items-center justify-center text-[20px] text-[var(--c-accent-2)]"
      style={{
        background: VISUAL_TYPES.has(type)
          ? "linear-gradient(135deg, var(--c-accent-soft), var(--c-bg-2))"
          : "var(--c-accent-soft)",
      }}
    >
      {TYPE_ICON[type] ?? "◐"}
    </div>
  );
}

function TaskIconMobile({ type }: { type: string }) {
  return (
    <div
      className="w-12 h-12 shrink-0 rounded-[12px] flex items-center justify-center text-[18px] text-[var(--c-accent-2)]"
      style={{
        background: VISUAL_TYPES.has(type)
          ? "linear-gradient(135deg, var(--c-accent-soft), var(--c-bg-2))"
          : "var(--c-accent-soft)",
      }}
    >
      {TYPE_ICON[type] ?? "◐"}
    </div>
  );
}

export function QueueTaskCard({ task, onCancel, onRetry, onDelete }: QueueTaskCardProps) {
  const isRunning = task.status === "running";
  const border = cardBorder(task.status);

  return (
    <>
      {/* ── Mobile (< md) ── */}
      <div
        className={`flex flex-col md:hidden bg-[var(--bg-card)] rounded-[16px] px-[14px] py-[14px] gap-3 ${border}`}
      >
        {/* Row 1: icon + content */}
        <div className="flex items-start gap-3">
          <TaskIconMobile type={task.type} />
          <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
            <p className="text-[15px] font-medium text-[var(--c-fg)] leading-[1.3] line-clamp-2">
              {task.prompt}
            </p>
            <QueueTaskMeta
              modelName={task.modelName}
              status={task.status}
              credits={task.credits}
              durationLabel={task.durationLabel}
              queuePosition={task.queuePosition}
              errorMessage={task.errorMessage}
              compact
            />
          </div>
        </div>

        {/* Row 2: progress (running only) */}
        {isRunning && <ProgressBar progress={task.progress} />}

        {/* Row 3: badge + % / actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            {isRunning && (
              <span className="font-mono text-[13px] font-medium text-[var(--c-accent-2)] tabular-nums">
                {Math.round(task.progress)}%
              </span>
            )}
          </div>
          <QueueTaskActions
            taskId={task.id}
            status={task.status}
            onCancel={onCancel}
            onRetry={onRetry}
            onDelete={onDelete}
            large
          />
        </div>
      </div>

      {/* ── Desktop (≥ md) ── */}
      <div
        className={`hidden md:flex items-center gap-4 bg-[var(--bg-card)] rounded-[16px] px-4 ${
          isRunning ? "py-[14px]" : "py-[18px]"
        } ${border}`}
      >
        <TaskIconDesktop type={task.type} />

        <div className="flex-1 min-w-0 flex flex-col gap-[7px]">
          <p className="text-[15px] font-medium text-[var(--c-fg)] truncate leading-[1.3]">
            {task.prompt}
          </p>
          <QueueTaskMeta
            modelName={task.modelName}
            status={task.status}
            credits={task.credits}
            durationLabel={task.durationLabel}
            queuePosition={task.queuePosition}
            errorMessage={task.errorMessage}
          />
          {isRunning && <ProgressBar progress={task.progress} />}
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {isRunning && (
            <span className="font-mono text-[13px] font-medium text-[var(--c-accent-2)] tabular-nums">
              {Math.round(task.progress)}%
            </span>
          )}
          <StatusBadge status={task.status} />
          <QueueTaskActions
            taskId={task.id}
            status={task.status}
            onCancel={onCancel}
            onRetry={onRetry}
            onDelete={onDelete}
          />
        </div>
      </div>
    </>
  );
}
