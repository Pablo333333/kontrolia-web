'use client';

import { useParams } from 'next/navigation';
import { useTramite } from '@/features/tramites/hooks/use-tramites';
import { DocumentoVivo } from '@/components/documento-vivo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, FileText, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TramiteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: tramite, isLoading } = useTramite(id);

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!tramite) {
    return <div className="text-center p-12">Trámite no encontrado.</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/tramites">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Listado
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Detalles del Trámite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo</label>
                <p className="text-lg font-bold">{tramite.tipo}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Estado Actual</label>
                <div className="mt-1">
                  <Badge>{tramite.estadoName}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">Remitente</label>
                  <p className="text-sm">{tramite.remitenteName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">Destinatario</label>
                  <p className="text-sm">{tramite.destinatarioName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">Fecha Límite</label>
                  <p className="text-sm">{tramite.fechaLimite ? new Date(tramite.fechaLimite).toLocaleDateString() : 'Sin fecha'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <DocumentoVivo entityId={id} entityType="TRAMITE" />
        </div>
      </div>
    </div>
  );
}
