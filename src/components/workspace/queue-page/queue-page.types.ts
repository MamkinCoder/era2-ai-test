import type { QueueStatus } from "@/entities/generation/model/queue-types";

export type { QueueStatus as QueueTaskStatus };

export type QueueStatusFilter = "all" | "queued" | "running" | "done" | "failed";
export type QueueSortMode = "newest" | "oldest" | "activeFirst";

export type QueueTaskViewModel = {
  id: string;
  type: "text" | "image" | "video" | "audio" | "design";
  status: QueueStatus;
  prompt: string;
  modelName: string;
  credits: number;
  progress: number;
  createdAt: Date;
  durationLabel?: string;
  queuePosition?: number;
  errorMessage?: string;
  thumbnailUrl?: string;
};
