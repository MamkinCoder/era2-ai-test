import type { QueueTask } from "@/entities/generation-task";

export type QueueAction =
  | { type: "CANCEL"; id: string }
  | { type: "RETRY"; id: string }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_COMPLETED" }
  | { type: "ADD"; task: QueueTask }
  | { type: "START"; id: string }
  | { type: "PROGRESS"; id: string; value: number }
  | { type: "FINISH"; id: string; success: boolean; errorMessage?: string };

export function queueReducer(tasks: QueueTask[], action: QueueAction): QueueTask[] {
  switch (action.type) {
    case "CANCEL":
      return tasks.map((t) =>
        t.id === action.id && (t.status === "running" || t.status === "queued")
          ? { ...t, status: "cancelled", finishedAt: Date.now() }
          : t,
      );

    case "RETRY":
      return tasks.map((t) =>
        t.id === action.id && t.status === "failed"
          ? { ...t, status: "queued", progress: 0, retryCount: t.retryCount + 1, errorMessage: undefined, startedAt: undefined, finishedAt: undefined }
          : t,
      );

    case "DELETE":
      return tasks.filter((t) => t.id !== action.id);

    case "CLEAR_COMPLETED":
      return tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");

    case "ADD":
      return [...tasks, action.task];

    case "START":
      return tasks.map((t) =>
        t.id === action.id
          ? { ...t, status: "running", startedAt: Date.now(), progress: 0 }
          : t,
      );

    case "PROGRESS":
      return tasks.map((t) =>
        t.id === action.id ? { ...t, progress: action.value } : t,
      );

    case "FINISH":
      return tasks.map((t) =>
        t.id === action.id
          ? {
              ...t,
              status: action.success ? "done" : "failed",
              finishedAt: Date.now(),
              progress: action.success ? 100 : t.progress,
              errorMessage: action.errorMessage,
            }
          : t,
      );

    default:
      return tasks;
  }
}
