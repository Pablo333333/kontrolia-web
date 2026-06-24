'use client';

import { useTramites } from '@/features/tramites/hooks/use-tramites';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function CalendarPage() {
  const { data: tramites, isLoading } = useTramites();

  const tramitesConFecha = tramites?.filter(t => t.fechaLimite).sort((a, b) => 
    new Date(a.fechaLimite!).getTime() - new Date(b.fechaLimite!).getTime()
  );

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Calendario de Vencimientos</h1>
        <p className="text-muted-foreground">Próximas fechas límite para tus trámites.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {tramitesConFecha?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No hay trámites con fecha límite programada.
              </CardContent>
            </Card>
          ) : (
            tramitesConFecha?.map(t => (
              <Card key={t.id} className="hover:border-primary transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">{t.tipo} - {t.destinatarioName}</h3>
                      <p className="text-sm text-muted-foreground">Estado: {t.estadoName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={new Date(t.fechaLimite!) < new Date() ? 'destructive' : 'outline'}>
                      {new Date(t.fechaLimite!).toLocaleDateString()}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" /> 
                      {Math.ceil((new Date(t.fechaLimite!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días restantes
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Resumen Temporal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Vencidos</span>
                <Badge variant="destructive">
                  {tramitesConFecha?.filter(t => new Date(t.fechaLimite!) < new Date()).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Próximos (7 días)</span>
                <Badge variant="secondary">
                  {tramitesConFecha?.filter(t => {
                    const diff = new Date(t.fechaLimite!).getTime() - new Date().getTime();
                    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
