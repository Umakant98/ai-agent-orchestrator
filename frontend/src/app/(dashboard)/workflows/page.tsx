'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, GitBranch, Trash2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useWorkflowStore } from '@/store/workflow.store';
import { workflowsApi, executionsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { formatDate } from '@/lib/utils';

export default function WorkflowsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { workflows, setWorkflows } = useWorkflowStore();
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    workflowsApi.getAll()
      .then(r => setWorkflows(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, setWorkflows]);

  const handleExecute = async (wfId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExecuting(wfId);
    try {
      const res = await executionsApi.start(wfId);
      toast.success('Execution started!');
      router.push(`/executions/${res.data.id}`);
    } catch (err: unknown) {
      const axiosMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMessage || 'Failed to start execution');
    } finally {
      setExecuting(null);
    }
  };

  const handleDelete = async (wfId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this workflow?')) return;
    try {
      await workflowsApi.delete(wfId);
      setWorkflows(workflows.filter(w => w.id !== wfId));
      toast.success('Workflow deleted');
    } catch {
      toast.error('Failed to delete workflow');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Workflows</h1>
              <p className="text-gray-400">{workflows.length} total workflows</p>
            </div>
            <Link href="/workflows/create" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              New Workflow
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-20">
              <GitBranch className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No workflows yet</h3>
              <p className="text-gray-400 mb-4">Create your first AI agent workflow</p>
              <Link href="/workflows/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Create Workflow
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((wf) => (
                <Link key={wf.id} href={`/workflows/${wf.id}`} className="bg-gray-900 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{wf.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleExecute(wf.id, e)}
                        disabled={executing === wf.id}
                        className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
                        title="Execute"
                      >
                        {executing === wf.id ? (
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(wf.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {wf.description && <p className="text-sm text-gray-400 mb-4 line-clamp-2">{wf.description}</p>}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{wf.agents?.length || 0} agents</span>
                    <span>{formatDate(wf.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
