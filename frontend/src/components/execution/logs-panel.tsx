'use client';

import { useEffect, useRef } from 'react';
import { ExecutionLog } from '@/types';
import { cn } from '@/lib/utils';

interface LogsPanelProps {
  logs: ExecutionLog[];
  isLive?: boolean;
}

export function LogsPanel({ logs, isLive = false }: LogsPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLive) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isLive]);

  const levelColors: Record<string, string> = {
    info: 'text-green-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
  };

  return (
    <div className="bg-gray-950 rounded-xl border border-gray-700 p-4 font-mono text-sm h-[300px] overflow-y-auto">
      {isLive && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-400 text-xs">Live execution logs</span>
        </div>
      )}
      {logs.length === 0 ? (
        <p className="text-gray-600 text-center mt-8">No logs yet...</p>
      ) : (
        logs.map((log, idx) => (
          <div key={log.id || idx} className="flex gap-3 mb-1">
            <span className="text-gray-600 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={cn('shrink-0 uppercase text-xs font-bold', levelColors[log.level] || 'text-gray-400')}>
              [{log.level}]
            </span>
            <span className="text-gray-300 break-all">{log.message}</span>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
