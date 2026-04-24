'use client';

import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

const SUGGESTIONS = [
  'Build a system that reads documents, summarizes them, and emails a daily report',
  'Create a pipeline that monitors social media, analyzes sentiment, and generates insights',
  'Design a workflow that scrapes job listings, matches them to a resume, and applies automatically',
  'Build a research assistant that searches the web, synthesizes findings, and writes a report',
];

export function PromptInput({ onSubmit, isLoading = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) onSubmit(prompt.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your use case in natural language... e.g. 'Build a system that reads customer emails, categorizes them, and auto-responds with relevant information'"
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            rows={4}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-3 bottom-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-gray-400">Suggestions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              disabled={isLoading}
              className="text-xs text-gray-300 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-blue-500 hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              {s.substring(0, 60)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
