export interface User {
  id: string;
  email: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  goal?: string;
  tools: string[];
  config?: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; role: string; status: 'idle' | 'running' | 'completed' | 'failed' };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface WorkflowConfiguration {
  tasks: Array<{ id: string; name: string; description: string; dependencies: string[] }>;
  agents: Agent[];
  workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
  prompt?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  configuration: WorkflowConfiguration;
  createdAt: string;
  updatedAt: string;
  agents: Agent[];
  _count?: { executions: number };
}

export interface Execution {
  id: string;
  workflowId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  createdAt: string;
  workflow?: { name: string };
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  agentId?: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: string;
}

export interface GeneratedWorkflow {
  tasks: Array<{ id: string; name: string; description: string; dependencies: string[] }>;
  agents: Array<{ name: string; role: string; goal: string; tools: string[] }>;
  workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
}
