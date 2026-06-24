import { createContext, useEffect, useState, type ReactNode } from "react";
import { queueEngine } from "./queueEngine";
import type { QueueState, GenerationType } from "@/entities/generation-task";

export interface QueueContextValue extends QueueState {
  cancel: (id: string) => void;
  retry: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  addTask: (type: GenerationType, prompt: string) => string;
}

export const QueueContext = createContext<QueueContextValue | null>(null);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QueueState>(() => queueEngine.getState());

  useEffect(() => {
    queueEngine.start();
    const unsub = queueEngine.subscribe(setState);
    return () => {
      unsub();
      queueEngine.stop();
    };
  }, []);

  const value: QueueContextValue = {
    ...state,
    cancel: (id) => queueEngine.cancel(id),
    retry: (id) => queueEngine.retry(id),
    deleteTask: (id) => queueEngine.deleteTask(id),
    clearCompleted: () => queueEngine.clearCompleted(),
    addTask: (type, prompt) => queueEngine.addTask(type, prompt),
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}
