import { KanbanBoard } from '@/features/tickets/components/kanban-board';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function KanbanPage() {
  return (
    <div className="container mx-auto py-8 space-y-6 max-h-screen flex flex-col px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tramites"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            aria-label="Volver a trámites"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tablero Kanban</h1>
            <p className="text-gray-600">Gestiona el flujo de trámites activos visualmente.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
