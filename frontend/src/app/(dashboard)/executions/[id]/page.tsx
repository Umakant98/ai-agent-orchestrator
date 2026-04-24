'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { executionsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { ExecutionStatus } from '@/components/execution/execution-status';
import { LogsPanel } from '@/components/execution/logs-panel';
import { WorkflowGraph } from '@/components/workflow/workflow-graph';
import { Execution, ExecutionLog } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface WorkflowWithConfig {
  name: string;
  configuration?: {
    workflow?: {
      nodes: import('@/types').WorkflowNode[];
      edges: import('@/types').WorkflowEdge[];
    };
  };
}

interface ExecutionWithWorkflow extends Execution {
  workflow?: WorkflowWithConfig;
}

export default function ExecutionDetailPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const [execution, setExecution] = useState<ExecutionWithWorkflow | null>(null);
  const [logs, setLocalLogs] = useState<ExecutionLog[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const connectWebSocket = useCallback((executionId: string) => {
    const socket = io(`${WS_URL}/ws`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe:execution', { executionId });
    });

    socket.on('execution:started', () => {
      setExecution(prev => prev ? { ...prev, status: 'running' } : null);
    });

    socket.on('execution:completed', () => {
      setExecution(prev => prev ? { ...prev, status: 'completed' } : null);
      socket.disconnect();
    });

    socket.on('execution:failed', () => {
      setExecution(prev => prev ? { ...prev, status: 'failed' } : null);
      socket.disconnect();
    });

    socket.on('agent:started', (data: { agentId: string }) => {
      setAgentStatuses(prev => ({ ...prev, [data.agentId]: 'running' }));
    });

    socket.on('agent:completed', (data: { agentId: string }) => {
      setAgentStatuses(prev => ({ ...prev, [data.agentId]: 'completed' }));
    });

    socket.on('agent:failed', (data: { agentId: string }) => {
      setAgentStatuses(prev => ({ ...prev, [data.agentId]: 'failed' }));
    });

    socket.on('log', (data: ExecutionLog) => {
      setLocalLogs(prev => [...prev, data]);
    });
  }, []);

  const loadExecution = useCallback(async () => {
    try {
      const res = await executionsApi.getOne(params.id as string);
      setExecution(res.data);

      const logsRes = await executionsApi.getLogs(params.id as string);
      setLocalLogs(logsRes.data);

      if (res.data.status === 'running' || res.data.status === 'pending') {
        connectWebSocket(params.id as string);
      }
    } catch {
      toast.error('Failed to load execution');
    } finally {
      setLoading(false);
    }
  }, [params.id, connectWebSocket]);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadExecution();
  }, [isAuthenticated, router, loadExecution]);

  useEffect(() => {
    return () => { socketRef.current?.disconnect(); };
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!execution) return null;

  const workflowConfig = execution.workflow?.configuration;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Execution Monitor</h1>
              <p className="text-gray-400">{execution.workflow?.name}</p>
            </div>
            <button
              onClick={loadExecution}
              className="flex items-center gap-2 text-gray-400 hover:text-white border border-gray-700 px-3 py-2 rounded-lg hover:border-gray-500 transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="space-y-6">
            <ExecutionStatus execution={execution} />

            {workflowConfig?.workflow?.nodes && workflowConfig.workflow.nodes.length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Agent Status</h2>
                <WorkflowGraph
                  nodes={workflowConfig.workflow.nodes}
                  edges={workflowConfig.workflow.edges}
                  agentStatuses={agentStatuses}
                />
              </div>
            )}

            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Execution Logs</h2>
              <LogsPanel logs={logs} isLive={execution.status === 'running'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
