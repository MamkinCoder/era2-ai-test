import type { GenerationType } from "@/entities/generation/model/queue-types";

export type GenerationQueueStatusMode = "global" | "inline-trigger" | "mobile";

export type GenerationQueueStatusTaskView = {
  id: string;
  type: GenerationType;
  status: "queued" | "running";
  prompt: string;
  modelName: string;
  progress: number;
};
