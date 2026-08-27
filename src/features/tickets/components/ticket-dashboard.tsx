'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTickets, useArchivedTickets, useChangeTicketStatus, useTicketSearch } from '../hooks/use-tickets';
import { useCategories, useWorkflowStates, useUsers, useMyPreferences } from '@/features/catalog/hooks/use-catalog';
import { isHistoricalTicket } from '../utils/message-labels';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, Inbox } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { isManager } from '@/features/auth/utils/roles';

type InboxView = 'active' | 'historical';

const MESSAGE_TYPE_OPTIONS = [
  { value: 'COORDINACION', label: 'Coordinación' },
  { value: 'TRAMITE', label: 'Trámite' },
  { value: 'DOCUMENTOS_TECNICOS', label: 'Documentos técnicos' },
  { value: 'CONVENIOS', label: 'Convenios' },
];

const PRIORITY_OPTIONS = [
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
];

type TicketDashboardProps = {
  searchQuery?: string;
  searchMode?: 'literal' | 'semantic';
};

export const TicketDashboard = ({ searchQuery = '', searchMode = 'semantic' }: TicketDashboardProps) => {
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [workflowStateId, setWorkflowStateId] = useState('');
  const [priority, setPriority] = useState('');
  const [messageType, setMessageType] = useState('');
  const [remitenteId, setRemitenteId] = useState('');
  const [destinatarioId, setDestinatarioId] = useState('');
  const [inboxView, setInboxView] = useState<InboxView>('active');
  const router = useRouter();
  const user = useCurrentUser();
  const canChangeStatus = isManager(user);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { data: prefs } = useMyPreferences();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (prefs?.defaultInboxView === 'historical') {
      setInboxView('historical');
    }
  }, [prefs?.defaultInboxView]);

  const { data: categories } = useCategories();
  const { data: states } = useWorkflowStates();
  const { data: users } = useUsers();

  const selectedCategory = categories?.find(c => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  const isSearching = searchQuery.trim().length > 0;
  const effectiveSearchMode = (prefs?.searchMode as 'literal' | 'semantic') || searchMode;

  const { data: searchResults, isLoading: loadingSearch } = useTicketSearch(
    searchQuery,
    effectiveSearchMode,
    { enabled: isSearching },
  );

  const listFilters = {
    categoryId: categoryId || undefined,
    subcategoryId: subcategoryId || undefined,
    workflowStateId: workflowStateId || undefined,
    priority: priority || undefined,
    messageType: messageType || undefined,
    userId: remitenteId || undefined,
    destinatarioId: destinatarioId || undefined,
    limit: 100,
  };

  const { data: activeTickets, isLoading: loadingActive } = useTickets(listFilters, {
    enabled: !isSearching,
  });
  const { data: archivedTickets, isLoading: loadingArchived } = useArchivedTickets({
    enabled: !isSearching && inboxView === 'historical',
  });
  const changeStatusMutation = useChangeTicketStatus();

  const sourceTickets = isSearching
    ? searchResults
    : inboxView === 'historical'
      ? archivedTickets
      : activeTickets;
  const isLoading = isSearching
    ? loadingSearch
    : inboxView === 'historical'
      ? loadingArchived
      : loadingActive;

  const tickets = useMemo(() => {
    let all = sourceTickets ?? [];
    if (isSearching) return all;
    if (inboxView === 'historical') {
      all = all.filter(isHistoricalTicket);
      if (categoryId) all = all.filter(t => t.categoryId === categoryId);
      if (subcategoryId) all = all.filter(t => t.subcategoryId === subcategoryId);
      if (priority) all = all.filter(t => t.priority === priority);
      if (messageType) all = all.filter(t => t.messageType === messageType);
      if (remitenteId) all = all.filter(t => t.userId === remitenteId);
      if (destinatarioId) all = all.filter(t => t.destinatarioId === destinatarioId);
      return all;
    }
    return all.filter(t => !isHistoricalTicket(t));
  }, [sourceTickets, inboxView, categoryId, subcategoryId, priority, messageType, remitenteId, destinatarioId, isSearching]);

  const visibleStates = useMemo(() => {
    if (!states) return [];
    if (inboxView === 'historical') {
      return states.filter(s => s.name.toUpperCase() === 'CERRADO');
    }
    return states.filter(s => s.name.toUpperCase() !== 'CERRADO');
  }, [states, inboxView]);

  const handleStatusChange = (ticketId: string, newStateId: string) => {
    changeStatusMutation.mutate({ id: ticketId, newStateId });
  };

  const clearFilters = () => {
    setCategoryId('');
    setSubcategoryId('');
    setWorkflowStateId('');
    setPriority('');
    setMessageType('');
    setRemitenteId('');
    setDestinatarioId('');
  };

  if (isAuthenticated === false) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">Debes iniciar sesión para ver esta página.</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {isSearching ? 'Resultados de búsqueda' : 'Dashboard de Mensajes'}
        </h1>
        <Link
          href="/tickets/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          + Nuevo Mensaje
        </Link>
      </div>

      {!isSearching && (
      <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setInboxView('active');
            setWorkflowStateId('');
          }}
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
          onClick={() => {
            setInboxView('historical');
            setWorkflowStateId('');
          }}
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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
          >
            <option value="">Todas</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
          <select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={!categoryId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white disabled:bg-gray-50"
          >
            <option value="">Todas</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        {inboxView === 'active' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={workflowStateId}
              onChange={(e) => setWorkflowStateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
            >
              <option value="">Todos los activos</option>
              {visibleStates.map((state) => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
          >
            <option value="">Todas</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
          >
            <option value="">Todos</option>
            {MESSAGE_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remitente</label>
          <select
            value={remitenteId}
            onChange={(e) => setRemitenteId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
          >
            <option value="">Todos</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>{u.name || u.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario</label>
          <select
            value={destinatarioId}
            onChange={(e) => setDestinatarioId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
          >
            <option value="">Todos</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>{u.name || u.email}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={clearFilters}
            className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
      </>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Título</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Cadena</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Categoría</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Cargando mensajes...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  {inboxView === 'historical'
                    ? 'No hay mensajes cerrados en el histórico.'
                    : 'No se encontraron mensajes activos.'}
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <span className="font-medium text-blue-600 hover:underline">{ticket.title}</span>
                      {ticket.subcategoryName && (
                        <span className="block text-xs text-gray-400 mt-0.5">{ticket.subcategoryName}</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                      ticket.isContinuation
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.isContinuation ? 'Continuación' : 'Nuevo tema'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded-md">{ticket.categoryName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {inboxView === 'historical' || !canChangeStatus ? (
                      <span className={`px-2 py-1 rounded-md font-medium ${
                        ticket.statusName === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                        ticket.statusName === 'CERRADO' ? 'bg-stone-100 text-stone-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ticket.statusName}
                      </span>
                    ) : (
                      <select
                        value={ticket.workflowStateId}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className={`px-2 py-1 rounded-md font-medium outline-none cursor-pointer ${
                          ticket.statusName === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                          ticket.statusName === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {visibleStates.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.fechaLimite ?? ticket.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
