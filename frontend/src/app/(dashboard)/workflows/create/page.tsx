'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useWorkflowStore } from '@/store/workflow.store';
import { workflowsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { PromptInput } from '@/components/workflow/prompt-input';
import { AgentCard } from '@/components/workflow/agent-card';
import { WorkflowGraph } from '@/components/workflow/workflow-graph';

export default function CreateWorkflowPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { generatedWorkflow, setGeneratedWorkflow } = useWorkflowStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setCurrentPrompt(prompt);
    try {
      const res = await workflowsApi.generateAgents(prompt);
      setGeneratedWorkflow(res.data);
      setWorkflowName(`Workflow - ${prompt.substring(0, 40)}...`);
      toast.success('Workflow generated successfully!');
    } catch (err: unknown) {
      const axiosMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMessage || 'Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedWorkflow || !workflowName.trim()) {
      toast.error('Please generate a workflow and provide a name first');
      return;
    }
    setIsSaving(true);
    try {
      const res = await workflowsApi.create({
        name: workflowName,
        description: currentPrompt,
        configuration: { ...generatedWorkflow, prompt: currentPrompt },
      });
      setGeneratedWorkflow(null);
      toast.success('Workflow saved!');
      router.push(`/workflows/${res.data.id}`);
    } catch (err: unknown) {
      const axiosMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMessage || 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Create Workflow</h1>
            <p className="text-gray-400">Describe your use case and AI will generate a multi-agent workflow</p>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-400" />
              Describe Your Use Case
            </h2>
            <PromptInput onSubmit={handleGenerate} isLoading={isGenerating} />
          </div>

          {isGenerating && (
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-8 text-center mb-6">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-white font-medium">Generating your workflow...</p>
              <p className="text-gray-400 text-sm mt-1">AI is analyzing your prompt and creating specialized agents</p>
            </div>
          )}

          {generatedWorkflow && !isGenerating && (
            <>
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Workflow Visualization</h2>
                <WorkflowGraph nodes={generatedWorkflow.workflow.nodes} edges={generatedWorkflow.workflow.edges} />
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Generated Agents ({generatedWorkflow.agents.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {generatedWorkflow.agents.map((agent) => (
                    <AgentCard key={agent.name} agent={{ ...agent, id: agent.name, tools: agent.tools || [] }} />
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Save Workflow</h2>
                <div className="flex gap-4">
                  <input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="Workflow name"
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !workflowName.trim()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
