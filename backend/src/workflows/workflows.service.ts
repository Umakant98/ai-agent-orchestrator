import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { GenerateAgentsDto } from './dto/generate-agents.dto';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async generateAgents(dto: GenerateAgentsDto) {
    const result = await this.aiService.generateWorkflowFromPrompt(dto.prompt);
    return result;
  }

  async create(userId: string, dto: CreateWorkflowDto) {
    const workflow = await this.prisma.workflow.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        configuration: dto.configuration,
        status: 'draft',
      },
    });

    const config = dto.configuration as any;
    if (config.agents && Array.isArray(config.agents)) {
      await this.prisma.agent.createMany({
        data: config.agents.map((agent: any) => ({
          workflowId: workflow.id,
          name: agent.name,
          role: agent.role,
          goal: agent.goal || '',
          config: agent.config || {},
          tools: agent.tools || [],
        })),
      });
    }

    return this.findOne(workflow.id, userId);
  }

  async findAll(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId },
      include: { agents: true, _count: { select: { executions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: { agents: true, executions: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    if (!workflow) throw new NotFoundException('Workflow not found');
    if (workflow.userId !== userId) throw new ForbiddenException();
    return workflow;
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.workflow.delete({ where: { id } });
    return { message: 'Workflow deleted successfully' };
  }
}
