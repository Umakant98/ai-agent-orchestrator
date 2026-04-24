'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Bot } from 'lucide-react';
import { WorkflowNode, WorkflowEdge } from '@/types';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  idle: 'border-gray-500 bg-gray-800',
  running: 'border-blue-400 bg-blue-900/40 shadow-blue-500/30 shadow-lg',
  completed: 'border-green-400 bg-green-900/40',
  failed: 'border-red-400 bg-red-900/40',
};

function AgentNode({ data }: NodeProps) {
  return (
    <div className={cn('px-4 py-3 rounded-xl border-2 min-w-[140px] text-center transition-all duration-500', statusColors[data.status as string] || statusColors.idle)}>
      <Handle type="target" position={Position.Left} className="!bg-gray-500" />
      <div className="flex flex-col items-center gap-1">
        <Bot className="h-6 w-6 text-blue-400" />
        <div className="font-semibold text-white text-sm">{data.label}</div>
        <div className="text-xs text-gray-400">{data.role}</div>
        {data.status === 'running' && (
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse mt-1" />
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-500" />
    </div>
  );
}

const nodeTypes = { agentNode: AgentNode };

interface WorkflowGraphProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  agentStatuses?: Record<string, string>;
}

export function WorkflowGraph({ nodes, edges, agentStatuses = {} }: WorkflowGraphProps) {
  const rfNodes: Node[] = useMemo(() =>
    nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        status: agentStatuses[n.id] || n.data.status || 'idle',
      },
    })),
    [nodes, agentStatuses]
  );

  const rfEdges: Edge[] = useMemo(() =>
    edges.map((e) => ({
      ...e,
      style: { stroke: '#6b7280' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
    })),
    [edges]
  );

  const [flowNodes, , onNodesChange] = useNodesState(rfNodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(rfEdges);

  return (
    <div className="h-[400px] bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#374151" gap={16} />
        <Controls className="!bg-gray-800 !border-gray-700" />
        <MiniMap className="!bg-gray-800 !border-gray-700" nodeColor="#3b82f6" />
      </ReactFlow>
    </div>
  );
}
