'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  User,
  Calendar,
  FileText,
  Archive,
  Inbox,
  CalendarDays,
} from 'lucide-react';
import { useTickets, useArchivedTickets } from '@/features/tickets/hooks/use-tickets';
import { useCategories, useUsers } from '@/features/catalog/hooks/use-catalog';
import {
  formatTramiteType,
  isTramiteTicket,
  isHistoricalTicket,
} from '@/features/tickets/utils/message-labels';
import { TicketResponse } from '@/features/tickets/types';

type InboxView = 'active' | 'historical';

const PRIORITY_OPTIONS = [
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
];

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-ES');
}

function RespuestaCell({ ticket }: { ticket: TicketResponse }) {
  const content = ticket.lastResponseContent?.trim();
  if (!content) {
    return <span className="text-sm text-gray-400">Sin respuesta</span>;
  }
  return (
    <div className="max-w-[220px]">
      <p className="text-sm text-gray-700 line-clamp-2" title={content}>
        {content}
      </p>
      {ticket.lastResponseAt && (
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(ticket.lastResponseAt)}</p>
      )}
    </div>
  );
}

function ArchivoCell({ ticket }: { ticket: TicketResponse }) {
  const docs = ticket.documents ?? [];
  if (docs.length === 0) {
    return <span className="text-sm text-gray-400">Sin archivo</span>;
  }

  const latest = docs.find(d => d.isLatest) ?? docs[0];
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
    >
      <FileText size={14} />
      <span className="truncate max-w-[140px]">{latest.name}</span>
      {docs.length > 1 && (
        <span className="text-xs text-gray-400">+{docs.length - 1}</span>
      )}
    </Link>
  );
}

export default function TramitesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inboxView, setInboxView] = useState<InboxView>('active');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [priority, setPriority] = useState('');
  const [remitenteId, setRemitenteId] = useState('');
  const [destinatarioId, setDestinatarioId] = useState('');

  const { data: categories } = useCategories();
  const { data: users } = useUsers();
  const selectedCategory = categories?.find(c => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  const listFilters = {
    categoryId: categoryId || undefined,
    subcategoryId: subcategoryId || undefined,
    priority: priority || undefined,
    userId: remitenteId || undefined,
    destinatarioId: destinatarioId || undefined,
    messageType: 'TRAMITE',
    includeDocuments: true,
    limit: 100,
  };

  const { data: activeTickets, isLoading: loadingActive } = useTickets(listFilters);
  const { data: archivedTickets, isLoading: loadingArchived } = useArchivedTickets({
    enabled: inboxView === 'historical',
  });

  const sourceTickets = inboxView === 'historical' ? archivedTickets : activeTickets;
  const isLoading = inboxView === 'historical' ? loadingArchived : loadingActive;

  const filteredTramites = useMemo(() => {
    let tramites = (sourceTickets ?? []).filter(isTramiteTicket);

    if (inboxView === 'historical') {
      tramites = tramites.filter(isHistoricalTicket);
      if (categoryId) tramites = tramites.filter(t => t.categoryId === categoryId);
      if (subcategoryId) tramites = tramites.filter(t => t.subcategoryId === subcategoryId);
      if (priority) tramites = tramites.filter(t => t.priority === priority);
      if (remitenteId) tramites = tramites.filter(t => t.userId === remitenteId);
      if (destinatarioId) tramites = tramites.filter(t => t.destinatarioId === destinatarioId);
    } else {
      tramites = tramites.filter(t => !isHistoricalTicket(t));
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) return tramites;

    return tramites.filter(t =>
      t.title.toLowerCase().includes(term) ||
      (t.remitenteName?.toLowerCase().includes(term) ?? false) ||
      (t.destinatarioName?.toLowerCase().includes(term) ?? false) ||
      (t.lastResponseContent?.toLowerCase().includes(term) ?? false) ||
      formatTramiteType(t).toLowerCase().includes(term),
    );
  }, [sourceTickets, inboxView, searchTerm, categoryId, subcategoryId, priority, remitenteId, destinatarioId]);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Trámites</h1>
            <p className="text-gray-600">Seguimiento de expedientes, oficios y solicitudes</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/tramites/calendar"
              className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium shadow-sm inline-flex items-center gap-2"
            >
              <CalendarDays size={16} />
              Calendario
            </Link>
            <Link
              href="/tickets/new?category=DOCUMENTACIÓN&title=Nuevo Trámite"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-bold shadow-sm"
            >
              + Iniciar Trámite
            </Link>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInboxView('active')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inboxView === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Inbox size={16} />
            Activos
          </button>
          <button
            type="button"
            onClick={() => setInboxView('historical')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inboxView === 'historical'
                ? 'bg-stone-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Archive size={16} />
            Histórico (Cerrados)
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por tipo, remitente, destinatario o respuesta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">Categoría</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-50"
            >
              <option value="">Subcategoría</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">Prioridad</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <select
              value={remitenteId}
              onChange={(e) => setRemitenteId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">Remitente</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
            <select
              value={destinatarioId}
              onChange={(e) => setDestinatarioId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">Destinatario</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Tipo de trámite</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Remitente</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Destinatario</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Estado</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Fecha</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Archivo</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Respuesta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    Cargando trámites...
                  </td>
                </tr>
              ) : filteredTramites.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    {inboxView === 'historical'
                      ? 'No hay trámites cerrados en el histórico.'
                      : 'No se encontraron trámites activos.'}
                  </td>
                </tr>
              ) : (
                filteredTramites.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/tickets/${t.id}`} className="font-medium text-blue-600 hover:underline">
                        {formatTramiteType(t)}
                      </Link>
                      {t.subcategoryName && (
                        <span className="block text-xs text-gray-400 mt-0.5">{t.subcategoryName}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={14} className="text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">{t.remitenteName ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {t.destinatarioName ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                        t.statusName === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                        t.statusName === 'CERRADO' ? 'bg-stone-100 text-stone-700' :
                        t.statusName === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {t.statusName ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        {formatDate(t.fechaLimite ?? t.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ArchivoCell ticket={t} />
                    </td>
                    <td className="px-6 py-4">
                      <RespuestaCell ticket={t} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
