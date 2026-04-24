import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrchestratorService } from '../executions/orchestrator.service';
import { EXECUTION_QUEUE } from './queue.constants';

@Processor(EXECUTION_QUEUE)
export class ExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(ExecutionProcessor.name);

  constructor(private orchestratorService: OrchestratorService) {
    super();
  }

  async process(job: Job<{ executionId: string; workflowId: string; userId: string }>) {
    this.logger.log(`Processing execution job ${job.id}: ${job.data.executionId}`);
    await this.orchestratorService.executeWorkflow(
      job.data.executionId,
      job.data.workflowId,
      job.data.userId,
    );
  }
}
