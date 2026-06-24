'use client';

import { useState } from 'react';
import { useTickets } from '../hooks/use-tickets';
import { useCategories, useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import Link from 'next/link';

export const TicketDashboard = () => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [workflowStateId, setWorkflowStateId] = useState<string>('');

  const { data: categories } = useCategories();
  const { data: states } = useWorkflowStates();
  const { data: tickets, isLoading } = useTickets({ categoryId, workflowStateId });

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
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
                    <span className={`px-2 py-1 rounded-md font-medium ${
                      ticket.statusName === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                      ticket.statusName === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.statusName}
                    </span>
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
