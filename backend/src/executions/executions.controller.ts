import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionsService } from './executions.service';

@Controller('executions')
export class ExecutionsController {
  constructor(private executionsService: ExecutionsService) {}

  @Post('workflow/:workflowId')
  @UseGuards(JwtAuthGuard)
  startExecution(@Request() req: any, @Param('workflowId') workflowId: string) {
    return this.executionsService.startExecution(workflowId, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserExecutions(@Request() req: any) {
    return this.executionsService.getUserExecutions(req.user.id);
  }

  @Get(':executionId')
  @UseGuards(JwtAuthGuard)
  getExecution(@Request() req: any, @Param('executionId') executionId: string) {
    return this.executionsService.getExecution(executionId, req.user.id);
  }

  @Get(':executionId/logs')
  @UseGuards(JwtAuthGuard)
  getExecutionLogs(@Request() req: any, @Param('executionId') executionId: string) {
    return this.executionsService.getExecutionLogs(executionId, req.user.id);
  }
}
