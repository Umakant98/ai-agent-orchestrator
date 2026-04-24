import { Bot, Wrench, Target } from 'lucide-react';
import { Agent } from '@/types';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  status?: 'idle' | 'running' | 'completed' | 'failed';
}

export function AgentCard({ agent, status = 'idle' }: AgentCardProps) {
  const statusColors = {
    idle: 'border-gray-600 bg-gray-800/50',
    running: 'border-blue-500 bg-blue-900/20 shadow-blue-500/20 shadow-lg',
    completed: 'border-green-500 bg-green-900/20',
    failed: 'border-red-500 bg-red-900/20',
  };

  const statusDotColors = {
    idle: 'bg-gray-500',
    running: 'bg-blue-400 animate-pulse',
    completed: 'bg-green-400',
    failed: 'bg-red-400',
  };

  return (
    <div className={cn('rounded-xl border-2 p-4 transition-all duration-300', statusColors[status])}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">{agent.name}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn('h-2 w-2 rounded-full', statusDotColors[status])} />
          <span className="text-xs text-gray-400 capitalize">{status}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <Target className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-sm text-gray-300">{agent.role}</span>
      </div>

      {agent.goal && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{agent.goal}</p>
      )}

      {agent.tools && agent.tools.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Wrench className="h-3.5 w-3.5 text-gray-500" />
          {agent.tools.slice(0, 3).map((tool) => (
            <span key={tool} className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded">
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
