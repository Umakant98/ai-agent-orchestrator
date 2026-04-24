import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AgentsService } from '../agents/agents.service';
import { BaseAgent } from '../agents/base-agent';

interface WorkflowNode {
  id: string;
  data: { label: string; role: string; status: string };
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private agentsService: AgentsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async executeWorkflow(executionId: string, workflowId: string, userId: string): Promise<void> {
    await this.prisma.execution.update({
      where: { id: executionId },
      data: { status: 'running', startTime: new Date() },
    });

    try {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { agents: true },
      });

      if (!workflow) throw new Error('Workflow not found');

      const config = workflow.configuration as any;
      const nodes: WorkflowNode[] = config?.workflow?.nodes || [];
      const edges: WorkflowEdge[] = config?.workflow?.edges || [];

      await this.log(executionId, null, `Starting workflow: ${workflow.name}`, 'info');
      this.emit(executionId, 'execution:started', { executionId, workflowId, status: 'running' });

      const order = this.topologicalSort(nodes, edges);

      const agentMap = new Map<string, BaseAgent>();
      for (const node of nodes) {
        const dbAgent = workflow.agents.find((a) => a.name === node.data.label);
        const agent = this.agentsService.createAgent(
          node.data.label,
          node.data.role || node.data.label,
          dbAgent?.goal || `Handle ${node.data.label} tasks`,
          (dbAgent?.tools as string[]) || [],
        );
        agentMap.set(node.id, agent);
      }

      const results = new Map<string, string>();
      for (const nodeId of order) {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        const agent = agentMap.get(nodeId);
        if (!agent) continue;

        const dbAgent = workflow.agents.find((a) => a.name === node.data.label);

        await this.log(executionId, dbAgent?.id || null, `Agent ${agent.name} starting...`, 'info');
        this.emit(executionId, 'agent:started', { agentId: nodeId, agentName: agent.name, status: 'running' });

        const predecessors = edges.filter((e) => e.target === nodeId).map((e) => e.source);
        const inputContext = predecessors
          .map((predId) => results.get(predId))
          .filter(Boolean)
          .join('\n');

        const taskInput = inputContext
          ? `${agent.goal}\nContext from previous agents:\n${inputContext}`
          : agent.goal;

        try {
          const result = await agent.process(taskInput, this.aiService);
          results.set(nodeId, result);

          await this.log(
            executionId,
            dbAgent?.id || null,
            `Agent ${agent.name} completed: ${result.substring(0, 200)}`,
            'info',
          );
          this.emit(executionId, 'agent:completed', {
            agentId: nodeId,
            agentName: agent.name,
            status: 'completed',
            result: result.substring(0, 500),
          });

          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (agentError) {
          const errMsg = agentError instanceof Error ? agentError.message : String(agentError);
          await this.log(executionId, dbAgent?.id || null, `Agent ${agent.name} failed: ${errMsg}`, 'error');
          this.emit(executionId, 'agent:failed', {
            agentId: nodeId,
            agentName: agent.name,
            status: 'failed',
            error: errMsg,
          });
        }
      }

      await this.prisma.execution.update({
        where: { id: executionId },
        data: { status: 'completed', endTime: new Date() },
      });

      await this.log(executionId, null, 'Workflow execution completed successfully', 'info');
      this.emit(executionId, 'execution:completed', { executionId, workflowId, status: 'completed' });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Workflow execution failed: ${errMsg}`);
      await this.prisma.execution.update({
        where: { id: executionId },
        data: { status: 'failed', endTime: new Date() },
      });
      await this.log(executionId, null, `Workflow failed: ${errMsg}`, 'error');
      this.emit(executionId, 'execution:failed', { executionId, workflowId, status: 'failed', error: errMsg });
    }
  }

  private topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    }

    for (const edge of edges) {
      adjList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) queue.push(nodeId);
    }

    const result: string[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);
      for (const neighbor of adjList.get(nodeId) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    return result;
  }

  private async log(executionId: string, agentId: string | null, message: string, level: string) {
    await this.prisma.executionLog.create({
      data: { executionId, agentId, message, level },
    });
    this.emit(executionId, 'log', { executionId, agentId, message, level, timestamp: new Date() });
  }

  private emit(executionId: string, event: string, data: any) {
    this.eventEmitter.emit(`execution.${event}`, { executionId, ...data });
  }
}
