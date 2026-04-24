import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BaseAgent, PlannerAgent, ExecutorAgent, ReviewerAgent, NotifierAgent } from './base-agent';

@Injectable()
export class AgentsService {
  createAgent(name: string, role: string, goal: string, tools: string[]): BaseAgent {
    const id = uuidv4();
    switch (role.toLowerCase()) {
      case 'planner':
      case 'task planner':
        return new PlannerAgent(id);
      case 'executor':
      case 'task executor':
        return new ExecutorAgent(id);
      case 'reviewer':
      case 'quality reviewer':
        return new ReviewerAgent(id);
      case 'notifier':
      case 'notification agent':
        return new NotifierAgent(id);
      default:
        return new BaseAgent(id, name, role, goal, tools);
    }
  }
}
