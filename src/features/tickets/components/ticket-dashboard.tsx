'use client';

import { useState, useEffect } from 'react';
import { useTickets, useChangeTicketStatus } from '../hooks/use-tickets';
import { useCategories, useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const TicketDashboard = () => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [workflowStateId, setWorkflowStateId] = useState<string>('');
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const { data: categories } = useCategories();
  const { data: states } = useWorkflowStates();
  const { data: tickets, isLoading } = useTickets({ categoryId, workflowStateId });
  const changeStatusMutation = useChangeTicketStatus();

  const handleStatusChange = (ticketId: string, newStateId: string) => {
    changeStatusMutation.mutate({ id: ticketId, newStateId });
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Tickets</h1>
        <Link
          href="/tickets/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          + Nuevo Ticket
        </Link>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
          >
            <option value="">Todas las categorías</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Estado</label>
          <select
            value={workflowStateId}
            onChange={(e) => setWorkflowStateId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
          >
            <option value="">Todos los estados</option>
            {states?.map((state) => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Título</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Categoría</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">Cargando tickets...</td>
              </tr>
            ) : tickets?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No se encontraron tickets.</td>
              </tr>
            ) : (
              tickets?.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <span className="font-medium text-blue-600 hover:underline">{ticket.title}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded-md">{ticket.categoryName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={ticket.workflowStateId}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className={`px-2 py-1 rounded-md font-medium outline-none cursor-pointer ${
                        ticket.statusName === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                        ticket.statusName === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {states?.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
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
