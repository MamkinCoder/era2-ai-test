import { MessageSquare, Image, Video, Music, Layers } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { TaskActions } from "./TaskActions";
import { TaskMeta } from "./TaskMeta";
import type { QueueTaskViewModel } from "../model/selectors";

const TYPE_ICON: Record<string, React.ElementType> = {
  text: MessageSquare,
  image: Image,
  video: Video,
  audio: Music,
  design: Layers,
};

const VISUAL_TYPES = new Set(["image", "video", "design"]);

function cardBorder(status: string) {
  if (status === "running") return "border border-[rgba(232,84,32,0.35)]";
  return "border border-[#2d2420]";
}

export interface TaskCardProps {
  task: QueueTaskViewModel;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onCancel, onRetry, onDelete }: TaskCardProps) {
  const isRunning = task.status === "running";
  const Icon = TYPE_ICON[task.type] ?? Image;

  return (
    <div
      className={`flex flex-col bg-[var(--bg-card)] rounded-[16px] px-[14px] py-[14px] gap-3 ${cardBorder(task.status)}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 shrink-0 rounded-[12px] flex items-center justify-center text-[var(--c-accent-2)]"
          style={{
            background: VISUAL_TYPES.has(task.type)
              ? "linear-gradient(135deg, var(--c-accent-soft), var(--c-bg-2))"
              : "var(--c-accent-soft)",
          }}
        >
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
          <p className="text-[15px] font-medium text-[var(--c-fg)] leading-[1.3] line-clamp-2">
            {task.prompt}
          </p>
          <TaskMeta
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

      {isRunning && <ProgressBar progress={task.progress} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {isRunning && (
            <span className="font-mono text-[13px] font-medium text-[var(--c-accent-2)] tabular-nums">
              {Math.round(task.progress)}%
            </span>
          )}
        </div>
        <TaskActions
          taskId={task.id}
          status={task.status}
          onCancel={onCancel}
          onRetry={onRetry}
          onDelete={onDelete}
          large
        />
      </div>
    </div>
  );
}
