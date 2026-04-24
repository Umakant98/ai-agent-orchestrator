import { Execution } from '@/types';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import { Clock, CheckCircle, XCircle, Loader2, Timer } from 'lucide-react';

interface ExecutionStatusProps {
  execution: Execution;
}

export function ExecutionStatus({ execution }: ExecutionStatusProps) {
  const icons: Record<string, React.ReactNode> = {
    pending: <Timer className="h-5 w-5 text-yellow-400" />,
    running: <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />,
    completed: <CheckCircle className="h-5 w-5 text-green-400" />,
    failed: <XCircle className="h-5 w-5 text-red-400" />,
  };

  const duration = execution.startTime && execution.endTime
    ? Math.round((new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000)
    : null;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icons[execution.status]}
          <span className="font-semibold text-white capitalize">{execution.status}</span>
        </div>
        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(execution.status))}>
          {execution.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500 mb-1">Started</div>
          <div className="text-gray-300">{execution.startTime ? formatDate(execution.startTime) : '—'}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Ended</div>
          <div className="text-gray-300">{execution.endTime ? formatDate(execution.endTime) : '—'}</div>
        </div>
        {duration !== null && (
          <div>
            <div className="text-gray-500 mb-1">Duration</div>
            <div className="text-gray-300 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {duration}s
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
