import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface GeneratedWorkflow {
  tasks: Array<{ id: string; name: string; description: string; dependencies: string[] }>;
  agents: Array<{ name: string; role: string; goal: string; tools: string[] }>;
  workflow: { nodes: any[]; edges: any[] };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey: apiKey || 'sk-placeholder' });
  }

  async generateWorkflowFromPrompt(prompt: string): Promise<GeneratedWorkflow> {
    const systemPrompt = `You are an AI system architect. Given a user's natural language description of a task, 
    break it down into a multi-agent workflow system. Return ONLY valid JSON with this exact structure:
    {
      "tasks": [
        { "id": "task_1", "name": "Task Name", "description": "What this task does", "dependencies": [] }
      ],
      "agents": [
        { "name": "AgentName", "role": "Agent Role", "goal": "What the agent achieves", "tools": ["tool1", "tool2"] }
      ],
      "workflow": {
        "nodes": [
          { "id": "node_1", "type": "agentNode", "position": { "x": 100, "y": 100 }, "data": { "label": "AgentName", "role": "Agent Role", "status": "idle" } }
        ],
        "edges": [
          { "id": "edge_1", "source": "node_1", "target": "node_2", "animated": true }
        ]
      }
    }
    
    Always include at minimum: Planner, Executor, Reviewer, and Notifier agents.
    Ensure the workflow is a valid DAG (Directed Acyclic Graph).
    Return ONLY the JSON, no additional text.`;

    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey || apiKey === 'sk-placeholder') {
        return this.getMockWorkflow(prompt);
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('No content from OpenAI');

      return JSON.parse(content) as GeneratedWorkflow;
    } catch (error) {
      this.logger.warn(`OpenAI call failed, using mock: ${(error as Error).message}`);
      return this.getMockWorkflow(prompt);
    }
  }

  async processAgentTask(
    agentName: string,
    agentRole: string,
    agentGoal: string,
    taskDescription: string,
    context: string = '',
  ): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey || apiKey === 'sk-placeholder') {
        return `[${agentName}] Mock result: Processed task "${taskDescription}" successfully.`;
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are ${agentName}, an AI agent with the role: ${agentRole}. Your goal: ${agentGoal}. Be concise and actionable.`,
          },
          {
            role: 'user',
            content: context ? `Context: ${context}\n\nTask: ${taskDescription}` : taskDescription,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'Task completed.';
    } catch (error) {
      this.logger.warn(`Agent processing failed: ${(error as Error).message}`);
      return `[${agentName}] Processed task: ${taskDescription}`;
    }
  }

  private getMockWorkflow(prompt: string): GeneratedWorkflow {
    return {
      tasks: [
        { id: 'task_1', name: 'Planning', description: 'Plan the overall approach and break down the work', dependencies: [] },
        { id: 'task_2', name: 'Execution', description: 'Execute the planned tasks', dependencies: ['task_1'] },
        { id: 'task_3', name: 'Review', description: 'Review and validate outputs', dependencies: ['task_2'] },
        { id: 'task_4', name: 'Notification', description: 'Notify stakeholders of results', dependencies: ['task_3'] },
      ],
      agents: [
        { name: 'Planner', role: 'Task Planner', goal: 'Break down the user request into actionable tasks', tools: ['planning', 'analysis'] },
        { name: 'Executor', role: 'Task Executor', goal: 'Execute the planned tasks efficiently', tools: ['execution', 'api_calls'] },
        { name: 'Reviewer', role: 'Quality Reviewer', goal: 'Validate and ensure quality of outputs', tools: ['review', 'validation'] },
        { name: 'Notifier', role: 'Notification Agent', goal: 'Communicate results to stakeholders', tools: ['email', 'notifications'] },
      ],
      workflow: {
        nodes: [
          { id: 'node_1', type: 'agentNode', position: { x: 100, y: 100 }, data: { label: 'Planner', role: 'Task Planner', status: 'idle' } },
          { id: 'node_2', type: 'agentNode', position: { x: 350, y: 100 }, data: { label: 'Executor', role: 'Task Executor', status: 'idle' } },
          { id: 'node_3', type: 'agentNode', position: { x: 600, y: 100 }, data: { label: 'Reviewer', role: 'Quality Reviewer', status: 'idle' } },
          { id: 'node_4', type: 'agentNode', position: { x: 850, y: 100 }, data: { label: 'Notifier', role: 'Notification Agent', status: 'idle' } },
        ],
        edges: [
          { id: 'edge_1', source: 'node_1', target: 'node_2', animated: true },
          { id: 'edge_2', source: 'node_2', target: 'node_3', animated: true },
          { id: 'edge_3', source: 'node_3', target: 'node_4', animated: true },
        ],
      },
    };
  }
}
