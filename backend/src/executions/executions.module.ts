import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExecutionsController } from './executions.controller';
import { ExecutionsService } from './executions.service';
import { OrchestratorService } from './orchestrator.service';
import { AgentsModule } from '../agents/agents.module';
import { AiModule } from '../ai/ai.module';
import { EXECUTION_QUEUE } from '../queues/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: EXECUTION_QUEUE }),
    AgentsModule,
    AiModule,
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, OrchestratorService],
  exports: [ExecutionsService, OrchestratorService],
})
export class ExecutionsModule {}
