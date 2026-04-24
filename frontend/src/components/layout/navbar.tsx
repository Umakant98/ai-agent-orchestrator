'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, LogOut, LayoutDashboard, GitBranch } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-white">AgentOrchestrator</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/workflows" className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
              <GitBranch className="h-4 w-4" />
              Workflows
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
