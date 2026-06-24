import { createContext, useEffect, useReducer, type ReactNode } from "react";
import { queueEngine } from "./queueEngine";
import { queueReducer } from "./queueReducer";
import type { QueueAction } from "./queueReducer";
import type { QueueState, GenerationType } from "@/entities/generation-task";

export interface QueueContextValue extends QueueState {
  cancel: (id: string) => void;
  retry: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  addTask: (type: GenerationType, prompt: string) => string;
}

export const QueueContext = createContext<QueueContextValue | null>(null);

function stateReducer(state: QueueState, action: QueueAction): QueueState {
  return { tasks: queueReducer(state.tasks, action) };
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(stateReducer, queueEngine.getState());

  useEffect(() => {
    queueEngine.connect(dispatch);
    return () => queueEngine.disconnect();
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
