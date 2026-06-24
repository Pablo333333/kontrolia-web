'use client';

import { useState } from 'react';
import { useTramites } from '../../features/tramites/hooks/use-tramites';
import { useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Filter, Search, FileText, LayoutDashboard, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

export default function TramitesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: tramites, isLoading } = useTramites({ q: debouncedSearch });
  const { data: states } = useWorkflowStates();

  const filteredTramites = tramites?.filter(t => {
    const matchesStatus = !statusFilter || t.estadoId === statusFilter;
    return matchesStatus;
  });

  const getStatusColor = (statusName?: string) => {
    switch (statusName) {
      case 'NUEVO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETADO': return 'bg-green-100 text-green-800 border-green-200';
      case 'CERRADO': return 'bg-stone-100 text-stone-800 border-stone-200';
      case 'CANCELADO': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Trámites</h1>
          <p className="text-muted-foreground">Administra y haz seguimiento de documentos formales.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild title="Mapa">
            <Link href="/mapa">
              <MapPin className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild title="Analítica">
            <Link href="/analytics">
              <TrendingUp className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild title="Calendario">
            <Link href="/tramites/calendar">
              <CalendarIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tramites/kanban">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Ver Kanban
            </Link>
          </Button>
          <Button asChild>
            <Link href="/tramites/new">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Trámite
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tipo o nombres..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Todos los estados</option>
              {states?.map((state) => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Remitente</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Destinatario</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha Límite</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Cargando trámites...
                    </div>
                  </td>
                </tr>
              ) : filteredTramites?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center align-middle text-muted-foreground">
                    No se encontraron trámites.
                  </td>
                </tr>
              ) : (
                filteredTramites?.map((tramite) => (
                  <tr key={tramite.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {tramite.tipo}
                      </div>
                    </td>
                    <td className="p-4 align-middle">{tramite.remitenteName}</td>
                    <td className="p-4 align-middle">{tramite.destinatarioName}</td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline" className={getStatusColor(tramite.estadoName)}>
                        {tramite.estadoName}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      {tramite.fechaLimite ? new Date(tramite.fechaLimite).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 align-middle">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tramites/${tramite.id}`}>Ver Detalle</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
