import { create } from 'zustand';
import { Execution, ExecutionLog } from '@/types';

interface ExecutionState {
  executions: Execution[];
  currentExecution: Execution | null;
  logs: ExecutionLog[];
  isRunning: boolean;
  setExecutions: (executions: Execution[]) => void;
  setCurrentExecution: (execution: Execution | null) => void;
  addLog: (log: ExecutionLog) => void;
  setLogs: (logs: ExecutionLog[]) => void;
  setRunning: (running: boolean) => void;
  updateExecutionStatus: (id: string, status: string) => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  executions: [],
  currentExecution: null,
  logs: [],
  isRunning: false,
  setExecutions: (executions) => set({ executions }),
  setCurrentExecution: (execution) => set({ currentExecution: execution }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setLogs: (logs) => set({ logs }),
  setRunning: (running) => set({ isRunning: running }),
  updateExecutionStatus: (id, status) =>
    set((state) => ({
      executions: state.executions.map((e) => (e.id === id ? { ...e, status: status as Execution['status'] } : e)),
      currentExecution: state.currentExecution?.id === id
        ? { ...state.currentExecution, status: status as Execution['status'] }
        : state.currentExecution,
    })),
}));
