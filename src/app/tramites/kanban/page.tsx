import { KanbanBoard } from '@/features/tramites/components/kanban-board';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function KanbanPage() {
  return (
    <div className="container mx-auto py-8 space-y-6 max-h-screen flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tramites">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tablero Kanban</h1>
            <p className="text-muted-foreground">Gestiona el flujo de trámites visualmente.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
