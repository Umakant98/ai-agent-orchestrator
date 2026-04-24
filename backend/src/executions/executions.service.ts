import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EXECUTION_QUEUE } from '../queues/queue.constants';

@Injectable()
export class ExecutionsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(EXECUTION_QUEUE) private executionQueue: Queue,
  ) {}

  async startExecution(workflowId: string, userId: string) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    if (workflow.userId !== userId) throw new ForbiddenException();

    const execution = await this.prisma.execution.create({
      data: { workflowId, userId, status: 'pending' },
    });

    await this.executionQueue.add('execute', { executionId: execution.id, workflowId, userId });

    return execution;
  }

  async getExecution(executionId: string, userId: string) {
    const execution = await this.prisma.execution.findUnique({
      where: { id: executionId },
      include: { executionLogs: { orderBy: { timestamp: 'asc' } }, workflow: true },
    });
    if (!execution) throw new NotFoundException('Execution not found');
    if (execution.userId !== userId) throw new ForbiddenException();
    return execution;
  }

  async getExecutionLogs(executionId: string, userId: string) {
    const execution = await this.prisma.execution.findUnique({ where: { id: executionId } });
    if (!execution) throw new NotFoundException('Execution not found');
    if (execution.userId !== userId) throw new ForbiddenException();

    return this.prisma.executionLog.findMany({
      where: { executionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getUserExecutions(userId: string) {
    return this.prisma.execution.findMany({
      where: { userId },
      include: { workflow: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
