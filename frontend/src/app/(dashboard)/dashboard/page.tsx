'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, GitBranch, Activity, Clock, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useWorkflowStore } from '@/store/workflow.store';
import { useExecutionStore } from '@/store/execution.store';
import { workflowsApi, executionsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { cn, formatDate, getStatusColor } from '@/lib/utils';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { workflows, setWorkflows } = useWorkflowStore();
  const { executions, setExecutions } = useExecutionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const load = async () => {
      try {
        const [wRes, eRes] = await Promise.all([workflowsApi.getAll(), executionsApi.getAll()]);
        setWorkflows(wRes.data);
        setExecutions(eRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [isAuthenticated, router, setWorkflows, setExecutions]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Workflows', value: workflows.length, icon: GitBranch, color: 'text-blue-400' },
    { label: 'Executions', value: executions.length, icon: Activity, color: 'text-green-400' },
    { label: 'Running Now', value: executions.filter(e => e.status === 'running').length, icon: Clock, color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Manage your AI agent workflows</p>
            </div>
            <Link
              href="/workflows/create"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Workflow
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-900 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                  </div>
                  <Icon className={cn('h-8 w-8', color)} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Workflows</h2>
                <Link href="/workflows" className="text-blue-400 text-sm hover:text-blue-300">View all</Link>
              </div>
              <div className="space-y-3">
                {workflows.slice(0, 5).map((wf) => (
                  <Link key={wf.id} href={`/workflows/${wf.id}`} className="flex items-center justify-between bg-gray-900 rounded-xl border border-gray-700 p-4 hover:border-blue-500 transition-colors">
                    <div>
                      <p className="font-medium text-white">{wf.name}</p>
                      <p className="text-sm text-gray-400">{wf.agents?.length || 0} agents · {formatDate(wf.createdAt)}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </Link>
                ))}
                {workflows.length === 0 && (
                  <div className="bg-gray-900 rounded-xl border border-dashed border-gray-700 p-8 text-center">
                    <GitBranch className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No workflows yet</p>
                    <Link href="/workflows/create" className="text-blue-400 text-sm hover:text-blue-300">Create your first →</Link>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Executions</h2>
              </div>
              <div className="space-y-3">
                {executions.slice(0, 5).map((ex) => (
                  <Link key={ex.id} href={`/executions/${ex.id}`} className="flex items-center justify-between bg-gray-900 rounded-xl border border-gray-700 p-4 hover:border-blue-500 transition-colors">
                    <div>
                      <p className="font-medium text-white">{ex.workflow?.name || 'Unknown Workflow'}</p>
                      <p className="text-sm text-gray-400">{formatDate(ex.createdAt)}</p>
                    </div>
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(ex.status))}>
                      {ex.status}
                    </span>
                  </Link>
                ))}
                {executions.length === 0 && (
                  <div className="bg-gray-900 rounded-xl border border-dashed border-gray-700 p-8 text-center">
                    <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No executions yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
