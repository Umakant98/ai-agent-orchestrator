import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExecutionProcessor } from './execution.processor';
import { ExecutionsModule } from '../executions/executions.module';
import { EXECUTION_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: EXECUTION_QUEUE }),
    ExecutionsModule,
  ],
  providers: [ExecutionProcessor],
})
export class QueuesModule {}
