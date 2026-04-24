import { AiService } from '../ai/ai.service';

export interface AgentMemory {
  inputs: string[];
  outputs: string[];
  context: Record<string, any>;
}

export class BaseAgent {
  id: string;
  name: string;
  role: string;
  goal: string;
  tools: string[];
  memory: AgentMemory;

  constructor(
    id: string,
    name: string,
    role: string,
    goal: string,
    tools: string[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.goal = goal;
    this.tools = tools;
    this.memory = { inputs: [], outputs: [], context: {} };
  }

  async process(input: string, aiService: AiService): Promise<string> {
    this.memory.inputs.push(input);
    const context =
      this.memory.outputs.length > 0
        ? `Previous outputs: ${this.memory.outputs.slice(-3).join('\n')}`
        : '';
    const result = await aiService.processAgentTask(this.name, this.role, this.goal, input, context);
    this.memory.outputs.push(result);
    return result;
  }

  addContext(key: string, value: any) {
    this.memory.context[key] = value;
  }
}

export class PlannerAgent extends BaseAgent {
  constructor(id: string) {
    super(id, 'Planner', 'Task Planner', 'Break down complex tasks into actionable steps', [
      'planning',
      'analysis',
      'decomposition',
    ]);
  }
}

export class ExecutorAgent extends BaseAgent {
  constructor(id: string) {
    super(id, 'Executor', 'Task Executor', 'Execute planned tasks and produce concrete outputs', [
      'execution',
      'api_calls',
      'data_processing',
    ]);
  }
}

export class ReviewerAgent extends BaseAgent {
  constructor(id: string) {
    super(id, 'Reviewer', 'Quality Reviewer', 'Validate outputs and ensure quality standards are met', [
      'review',
      'validation',
      'quality_check',
    ]);
  }
}

export class NotifierAgent extends BaseAgent {
  constructor(id: string) {
    super(id, 'Notifier', 'Notification Agent', 'Communicate results and updates to stakeholders', [
      'email',
      'notifications',
      'reporting',
    ]);
  }
}
