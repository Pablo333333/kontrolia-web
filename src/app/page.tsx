"use client";

import { TicketDashboard } from "@/features/tickets/components/ticket-dashboard";
import { KanbanBoard } from "@/features/tickets/components/kanban-board";
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState<'list' | 'kanban'>('kanban');

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Kanban
          </button>
        </div>

        {view === 'list' ? <TicketDashboard /> : <KanbanBoard />}
      </div>
    </main>
  );
}
