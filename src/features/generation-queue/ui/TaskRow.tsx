import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { TaskActions } from "./TaskActions";
import { TaskMeta } from "./TaskMeta";
import type { QueueTaskViewModel } from "../model/selectors";

const VISUAL_TYPES = new Set(["image", "video", "design"]);

const TYPE_ICON: Record<string, string> = {
  text: "💬",
  image: "◐",
  video: "▷",
  audio: "♫",
  design: "◐",
};

function cardBorder(status: string) {
  if (status === "running") return "border border-[rgba(232,84,32,0.35)]";
  return "border border-[#2d2420]";
}

export interface TaskRowProps {
  task: QueueTaskViewModel;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskRow({ task, onCancel, onRetry, onDelete }: TaskRowProps) {
  const isRunning = task.status === "running";
  return (
    <div
      className={`flex items-center gap-4 bg-[var(--bg-card)] rounded-[16px] px-4 ${
        isRunning ? "py-[14px]" : "py-[18px]"
      } ${cardBorder(task.status)}`}
    >
      <div
        className="w-14 h-14 shrink-0 rounded-[12px] flex items-center justify-center text-[20px] text-[var(--c-accent-2)]"
        style={{
          background: VISUAL_TYPES.has(task.type)
            ? "linear-gradient(135deg, var(--c-accent-soft), var(--c-bg-2))"
            : "var(--c-accent-soft)",
        }}
      >
        {TYPE_ICON[task.type] ?? "◐"}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-[7px]">
        <p className="text-[15px] font-medium text-[var(--c-fg)] truncate leading-[1.3]">
          {task.prompt}
        </p>
        <TaskMeta
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
        <TaskActions
          taskId={task.id}
          status={task.status}
          onCancel={onCancel}
          onRetry={onRetry}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
