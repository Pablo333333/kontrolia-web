'use client';

import Link from 'next/link';
import { Loader2, Calendar as CalendarIcon, Clock, ArrowLeft } from 'lucide-react';
import { useTickets } from '@/features/tickets/hooks/use-tickets';
import { isTramiteTicket } from '@/features/tickets/utils/message-labels';
import { DeadlineCalendar } from '@/features/tickets/components/deadline-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CalendarPage() {
  const { data: tickets, isLoading } = useTickets();

  const tramitesConFecha = (tickets ?? [])
    .filter(isTramiteTicket)
    .filter(t => t.fechaLimite && !t.isArchived)
    .sort((a, b) => new Date(a.fechaLimite!).getTime() - new Date(b.fechaLimite!).getTime());

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const now = Date.now();
  const vencidos = tramitesConFecha.filter(t => new Date(t.fechaLimite!).getTime() < now).length;
  const proximos = tramitesConFecha.filter(t => {
    const diff = new Date(t.fechaLimite!).getTime() - now;
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Calendario de Vencimientos</h1>
          <p className="text-gray-600">Fechas límite de trámites activos.</p>
        </div>
        <Link
          href="/tramites"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Volver a trámites
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <DeadlineCalendar tickets={tickets ?? []} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-gray-500">Resumen temporal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Vencidos</span>
                <Badge variant="destructive">{vencidos}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Próximos (7 días)</span>
                <Badge variant="secondary">{proximos}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-gray-500">Próximos vencimientos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tramitesConFecha.length === 0 ? (
                <p className="text-sm text-gray-500">No hay trámites con fecha límite programada.</p>
              ) : (
                tramitesConFecha.slice(0, 8).map(t => (
                  <Link
                    key={t.id}
                    href={`/tickets/${t.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-blue-50 p-2 rounded-full text-blue-600 shrink-0">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-gray-500">{t.destinatarioName ?? 'Sin destinatario'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <Badge variant={new Date(t.fechaLimite!) < new Date() ? 'destructive' : 'outline'}>
                        {new Date(t.fechaLimite!).toLocaleDateString('es-ES')}
                      </Badge>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.ceil((new Date(t.fechaLimite!).getTime() - now) / (1000 * 60 * 60 * 24))} d
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
