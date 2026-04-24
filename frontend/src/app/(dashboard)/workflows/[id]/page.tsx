'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Play, ArrowLeft, Loader2, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { workflowsApi, executionsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { AgentCard } from '@/components/workflow/agent-card';
import { WorkflowGraph } from '@/components/workflow/workflow-graph';
import { Workflow } from '@/types';
import { formatDate } from '@/lib/utils';

export default function WorkflowDetailPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    workflowsApi.getOne(params.id as string)
      .then(r => setWorkflow(r.data))
      .catch(() => toast.error('Failed to load workflow'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, params.id, router]);

  const handleExecute = async () => {
    if (!workflow) return;
    setExecuting(true);
    try {
      const res = await executionsApi.start(workflow.id);
      toast.success('Execution started!');
      router.push(`/executions/${res.data.id}`);
    } catch (err: unknown) {
      const axiosMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMessage || 'Failed to start execution');
      setExecuting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!workflow) return null;

  const config = workflow.configuration;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/workflows" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{workflow.name}</h1>
              {workflow.description && <p className="text-gray-400 mt-1">{workflow.description}</p>}
            </div>
            <button
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Execute Workflow
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Workflow Graph</h2>
              {config?.workflow?.nodes?.length > 0 ? (
                <WorkflowGraph nodes={config.workflow.nodes} edges={config.workflow.edges} />
              ) : (
                <p className="text-gray-400">No workflow graph available</p>
              )}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                Agents ({workflow.agents?.length || 0})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {workflow.agents?.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
              <p className="text-sm text-gray-400">Created {formatDate(workflow.createdAt)} · {workflow.agents?.length || 0} agents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
