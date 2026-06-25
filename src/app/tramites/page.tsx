'use client';

import { useState, useMemo } from 'react';
import { useTickets } from '@/features/tickets/hooks/use-tickets';
import { useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import { FileText, Search, User, ArrowRight, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TramitesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: tickets, isLoading: isLoadingTickets } = useTickets();
  const { data: states } = useWorkflowStates();

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Trámites</h1>
            <p className="text-gray-600">Seguimiento de expedientes, oficios y solicitudes</p>
          </div>
          <Link
            href="/tickets/new?category=DOCUMENTACIÓN&title=Nuevo Trámite"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-bold shadow-sm"
          >
            + Iniciar Trámite
          </Link>
        </div>

        {/* Filtrar tickets que pertenecen a la categoría 'DOCUMENTACIÓN' (que usaremos para trámites) */}
        {/* O buscar tickets que tengan 'Trámite' en el título/descripción si no hay categoría específica */}
        {(() => {
          const tramites = tickets?.filter(t => 
            t.categoryName === 'DOCUMENTACIÓN' || 
            t.title.toLowerCase().includes('trámite')
          ) || [];

          const filteredTramites = tramites.filter(t => 
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return (
            <>
              {/* Búsqueda */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar trámite por título o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Tabla de Trámites */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-sm font-bold text-gray-700">ID / Título</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-700">Tipo</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-700">Remitente</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-700">Estado</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-700">Fecha Límite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTramites.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/tickets/${t.id}`} className="block">
                            <p className="text-xs text-gray-400 mb-1">#{t.id.substring(0, 8)}</p>
                            <p className="font-bold text-blue-600 group-hover:underline">{t.title}</p>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">
                            {t.title.toLowerCase().includes('oficio') ? 'OFICIO' : 
                             t.title.toLowerCase().includes('carta') ? 'CARTA' : 'SOLICITUD'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                              <User size={14} className="text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-700">Admin</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                            t.statusName === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                            t.statusName === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {t.statusName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            {new Date(t.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTramites.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          No se encontraron trámites activos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>
    </main>
  );
}
