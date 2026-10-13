'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotesLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <span className="font-semibold text-gray-900">Notes</span>
        </div>
        <nav aria-label="Notes navigation" className="p-3">
          <Link href="/ai-notes-summarizer" onClick={() => setIsSidebarOpen(false)}>
            <Button
              variant={pathname === '/ai-notes-summarizer' ? 'secondary' : 'ghost'}
              className={`my-1 w-full justify-start shadow-none ${
                pathname === '/ai-notes-summarizer' ? 'bg-gray-100' : ''
              }`}
            >
              <NotebookPen className="h-4 w-4" />
              AI Notes Summarizer
            </Button>
          </Link>
        </nav>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b border-gray-200 bg-white p-3 lg:hidden">
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-2 font-medium">AI Notes Summarizer</span>
        </div>
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
