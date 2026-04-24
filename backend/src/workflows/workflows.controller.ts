import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkflowsService } from './workflows.service';
import { GenerateAgentsDto } from './dto/generate-agents.dto';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

@Controller('workflows')
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Post('generate-agents')
  @UseGuards(JwtAuthGuard)
  generateAgents(@Body() dto: GenerateAgentsDto) {
    return this.workflowsService.generateAgents(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    return this.workflowsService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.workflowsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Request() req: any, @Param('id') id: string) {
    return this.workflowsService.delete(id, req.user.id);
  }

  @Post(':id/execute')
  @UseGuards(JwtAuthGuard)
  execute(@Request() req: any, @Param('id') id: string) {
    return { message: 'Use POST /executions/workflow/:id to execute' };
  }
}
