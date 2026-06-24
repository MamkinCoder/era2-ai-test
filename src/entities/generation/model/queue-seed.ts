import type { QueueTask } from "./queue-types";

let _counter = 1;
function id() {
  return `task-${String(_counter++).padStart(3, "0")}`;
}

const now = Date.now();
const sec = (s: number) => now - s * 1000;

export const SEED_TASKS: QueueTask[] = [
  {
    id: id(),
    type: "image",
    prompt: "Cyberpunk city at night, neon reflections on wet streets",
    status: "running",
    progress: 42,
    createdAt: sec(60),
    startedAt: sec(30),
    retryCount: 0,
  },
  {
    id: id(),
    type: "video",
    prompt: "Time-lapse of clouds over mountain peaks",
    status: "running",
    progress: 18,
    createdAt: sec(55),
    startedAt: sec(25),
    retryCount: 0,
  },
  {
    id: id(),
    type: "text",
    prompt: "Write a short poem about artificial intelligence",
    status: "queued",
    progress: 0,
    createdAt: sec(50),
    retryCount: 0,
  },
  {
    id: id(),
    type: "audio",
    prompt: "Ambient lo-fi music for focus sessions",
    status: "queued",
    progress: 0,
    createdAt: sec(45),
    retryCount: 0,
  },
  {
    id: id(),
    type: "design",
    prompt: "Minimalist logo for a tech startup called Nova",
    status: "queued",
    progress: 0,
    createdAt: sec(40),
    retryCount: 0,
  },
  {
    id: id(),
    type: "image",
    prompt: "Portrait of a samurai warrior in moonlight",
    status: "queued",
    progress: 0,
    createdAt: sec(35),
    retryCount: 0,
  },
  {
    id: id(),
    type: "text",
    prompt: "Generate product description for wireless earbuds",
    status: "done",
    progress: 100,
    createdAt: sec(120),
    startedAt: sec(110),
    finishedAt: sec(90),
    retryCount: 0,
  },
  {
    id: id(),
    type: "image",
    prompt: "Watercolor painting of a Japanese garden",
    status: "failed",
    progress: 67,
    createdAt: sec(200),
    startedAt: sec(190),
    finishedAt: sec(170),
    retryCount: 0,
    errorMessage: "Content policy violation detected",
  },
  {
    id: id(),
    type: "audio",
    prompt: "Epic orchestral battle theme",
    status: "cancelled",
    progress: 31,
    createdAt: sec(300),
    startedAt: sec(290),
    finishedAt: sec(280),
    retryCount: 0,
  },
  {
    id: id(),
    type: "video",
    prompt: "Abstract fluid simulation in pastel colors",
    status: "queued",
    progress: 0,
    createdAt: sec(30),
    retryCount: 0,
  },
];
