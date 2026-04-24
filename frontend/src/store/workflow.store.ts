import { create } from 'zustand';
import { Workflow, GeneratedWorkflow } from '@/types';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  generatedWorkflow: GeneratedWorkflow | null;
  isLoading: boolean;
  setWorkflows: (workflows: Workflow[]) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setGeneratedWorkflow: (workflow: GeneratedWorkflow | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  workflows: [],
  currentWorkflow: null,
  generatedWorkflow: null,
  isLoading: false,
  setWorkflows: (workflows) => set({ workflows }),
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  setGeneratedWorkflow: (workflow) => set({ generatedWorkflow: workflow }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
