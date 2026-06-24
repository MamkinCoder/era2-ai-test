import {
  MAX_CONCURRENT,
  FAILURE_RATE,
  QUEUE_DEBUG,
  TICK_SPEED,
  type QueueTask,
  type QueueState,
  type GenerationType,
} from "./queue-types";
import { SEED_TASKS } from "./queue-seed";

type Listener = (state: QueueState) => void;

function log(event: string, tasks: QueueTask[]) {
  if (!QUEUE_DEBUG) return;
  console.groupCollapsed(`[queue] ${event}`);
  console.table(
    tasks.map((t) => ({
      id: t.id,
      status: t.status,
      progress: t.progress,
      type: t.type,
      createdAt: t.createdAt,
    }))
  );
  console.groupEnd();
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

let _idCounter = 100;
function genId() {
  return `task-${String(++_idCounter).padStart(3, "0")}`;
}

class QueueEngine {
  private tasks: QueueTask[] = clone(SEED_TASKS);
  private listeners: Set<Listener> = new Set();
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private running = false;

  start() {
    if (this.running) return;
    this.running = true;
    // Attach timers to seed tasks already in running state (they have no timers yet)
    this.tasks
      .filter((t) => t.status === "running")
      .forEach((t) => this.attachTimer(t));
    this.schedule();
    log("start", this.tasks);
  }

  stop() {
    this.running = false;
    this.timers.forEach((t) => clearInterval(t));
    this.timers.clear();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener({ tasks: clone(this.tasks) });
    return () => this.listeners.delete(listener);
  }

  cancel(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task || (task.status !== "running" && task.status !== "queued")) return;

    this.clearTimer(id);
    task.status = "cancelled";
    task.finishedAt = Date.now();
    log("cancel", this.tasks);
    this.emit();
    this.schedule();
  }

  retry(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task || task.status !== "failed") return;

    task.status = "queued";
    task.progress = 0;
    task.retryCount += 1;
    task.errorMessage = undefined;
    task.startedAt = undefined;
    task.finishedAt = undefined;
    log("retry", this.tasks);
    this.emit();
    this.schedule();
  }

  clearCompleted() {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter(
      (t) => t.status !== "done" && t.status !== "cancelled"
    );
    if (this.tasks.length !== before) {
      log("clearCompleted", this.tasks);
      this.emit();
    }
  }

  addTask(type: GenerationType, prompt: string) {
    const task: QueueTask = {
      id: genId(),
      type,
      prompt,
      status: "queued",
      progress: 0,
      createdAt: Date.now(),
      retryCount: 0,
    };
    this.tasks.push(task);
    log("add", this.tasks);
    this.emit();
    this.schedule();
    return task.id;
  }

  getState(): QueueState {
    return { tasks: clone(this.tasks) };
  }

  private schedule() {
    if (!this.running) return;

    const runningCount = this.tasks.filter((t) => t.status === "running").length;
    const slots = MAX_CONCURRENT - runningCount;
    if (slots <= 0) return;

    const queued = this.tasks
      .filter((t) => t.status === "queued")
      .sort((a, b) => a.createdAt - b.createdAt);

    queued.slice(0, slots).forEach((task) => this.startTask(task));
  }

  private startTask(task: QueueTask) {
    task.status = "running";
    task.startedAt = Date.now();
    task.progress = 0;
    log(`start:${task.id}`, this.tasks);
    this.emit();
    this.attachTimer(task);
  }

  private attachTimer(task: QueueTask) {
    const speed = TICK_SPEED[task.type];

    const timer = setInterval(() => {
      const t = this.tasks.find((x) => x.id === task.id);
      if (!t || t.status !== "running") {
        this.clearTimer(task.id);
        return;
      }

      t.progress = Math.min(100, t.progress + speed + Math.random() * speed * 0.4);

      if (t.progress >= 100) {
        this.clearTimer(task.id);
        const failed = Math.random() < FAILURE_RATE;
        t.progress = failed ? t.progress : 100;
        t.status = failed ? "failed" : "done";
        t.finishedAt = Date.now();
        if (failed) {
          t.errorMessage = randomErrorMessage();
        }
        log(failed ? `fail:${t.id}` : `done:${t.id}`, this.tasks);
        this.emit();
        this.schedule();
      } else {
        this.emit();
      }
    }, 500);

    this.timers.set(task.id, timer);
  }

  private clearTimer(id: string) {
    const t = this.timers.get(id);
    if (t) {
      clearInterval(t);
      this.timers.delete(id);
    }
  }

  private emit() {
    const state: QueueState = { tasks: clone(this.tasks) };
    this.listeners.forEach((l) => l(state));
  }
}

const ERRORS = [
  "Content policy violation detected",
  "Model overloaded, please retry",
  "Invalid prompt structure",
  "Timeout: generation exceeded limit",
  "Resource quota exceeded",
];

function randomErrorMessage() {
  return ERRORS[Math.floor(Math.random() * ERRORS.length)];
}

export const queueEngine = new QueueEngine();
