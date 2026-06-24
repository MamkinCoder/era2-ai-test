import {
  MAX_CONCURRENT,
  FAILURE_RATE,
  QUEUE_DEBUG,
  TICK_SPEED,
  SEED_TASKS,
} from "@/entities/generation-task";
import type { QueueTask, QueueState, GenerationType } from "@/entities/generation-task";
import { queueReducer } from "./queueReducer";

type Listener = (state: QueueState) => void;

const STORAGE_KEY = "era2:queue:v1";

function loadPersisted(): QueueTask[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const tasks: QueueTask[] = JSON.parse(raw);
    return tasks.map((t) =>
      t.status === "running" ? { ...t, status: "queued", progress: 0, startedAt: undefined } : t,
    );
  } catch {
    return null;
  }
}

function persist(tasks: QueueTask[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

let _idCounter = 100;
function genId() {
  return `task-${String(++_idCounter).padStart(3, "0")}`;
}

const ERRORS = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
  "Ошибка генерации контента",
  "Сервер перегружен",
];

function randomError() {
  return ERRORS[Math.floor(Math.random() * ERRORS.length)];
}

function log(event: string, tasks: QueueTask[]) {
  if (!QUEUE_DEBUG) return;
  console.groupCollapsed(`[queue] ${event}`);
  console.table(tasks.map((t) => ({ id: t.id, status: t.status, progress: t.progress, type: t.type })));
  console.groupEnd();
}

class QueueEngine {
  private tasks: QueueTask[] = loadPersisted() ?? clone(SEED_TASKS);
  private listeners: Set<Listener> = new Set();
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private running = false;

  start() {
    if (this.running) return;
    this.running = true;
    this.tasks.filter((t) => t.status === "running").forEach((t) => this.attachTimer(t));
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

  getState(): QueueState {
    return { tasks: clone(this.tasks) };
  }

  cancel(id: string) {
    this.clearTimer(id);
    this.dispatch({ type: "CANCEL", id });
    this.schedule();
  }

  retry(id: string) {
    this.dispatch({ type: "RETRY", id });
    this.schedule();
  }

  deleteTask(id: string) {
    this.clearTimer(id);
    this.dispatch({ type: "DELETE", id });
    this.schedule();
  }

  clearCompleted() {
    this.dispatch({ type: "CLEAR_COMPLETED" });
  }

  addTask(type: GenerationType, prompt: string): string {
    const task: QueueTask = {
      id: genId(),
      type,
      prompt,
      status: "queued",
      progress: 0,
      createdAt: Date.now(),
      retryCount: 0,
    };
    this.dispatch({ type: "ADD", task });
    this.schedule();
    return task.id;
  }

  private dispatch(action: Parameters<typeof queueReducer>[1]) {
    this.tasks = queueReducer(this.tasks, action);
    log(action.type, this.tasks);
    this.emit();
  }

  private schedule() {
    if (!this.running) return;
    const runningCount = this.tasks.filter((t) => t.status === "running").length;
    const slots = MAX_CONCURRENT - runningCount;
    if (slots <= 0) return;
    this.tasks
      .filter((t) => t.status === "queued")
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, slots)
      .forEach((t) => this.startTask(t));
  }

  private startTask(task: QueueTask) {
    this.dispatch({ type: "START", id: task.id });
    const started = this.tasks.find((t) => t.id === task.id)!;
    this.attachTimer(started);
  }

  private attachTimer(task: QueueTask) {
    const speed = TICK_SPEED[task.type];
    const timer = setInterval(() => {
      const t = this.tasks.find((x) => x.id === task.id);
      if (!t || t.status !== "running") {
        this.clearTimer(task.id);
        return;
      }
      const next = Math.min(100, t.progress + speed + Math.random() * speed * 0.4);
      if (next >= 100) {
        this.clearTimer(task.id);
        const success = Math.random() >= FAILURE_RATE;
        this.dispatch({ type: "FINISH", id: task.id, success, errorMessage: success ? undefined : randomError() });
        this.schedule();
      } else {
        this.dispatch({ type: "PROGRESS", id: task.id, value: next });
      }
    }, 500);
    this.timers.set(task.id, timer);
  }

  private clearTimer(id: string) {
    const t = this.timers.get(id);
    if (t) { clearInterval(t); this.timers.delete(id); }
  }

  private emit() {
    persist(this.tasks);
    const state: QueueState = { tasks: clone(this.tasks) };
    this.listeners.forEach((l) => l(state));
  }
}

export const queueEngine = new QueueEngine();
