export const MAX_CONCURRENT = 2;
export const FAILURE_RATE = 0.15;

export const QUEUE_DEBUG = import.meta.env.VITE_QUEUE_DEBUG === "true";

export type QueueStatus =
  | "queued"
  | "running"
  | "done"
  | "failed"
  | "cancelled";

export type GenerationType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "design";

export interface QueueTask {
  id: string;
  type: GenerationType;
  prompt: string;
  status: QueueStatus;
  progress: number;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  retryCount: number;
  errorMessage?: string;
}

export interface QueueState {
  tasks: QueueTask[];
}

/** Speed in progress-points per tick (tick = 500ms) */
export const TICK_SPEED: Record<GenerationType, number> = {
  text: 12,
  image: 6,
  audio: 8,
  video: 3,
  design: 5,
};
