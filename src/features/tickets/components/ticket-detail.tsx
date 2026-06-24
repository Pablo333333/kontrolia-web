'use client';

import { useTicket, useTicketHistory, useChangeTicketStatus, useTicketDocuments, useGenerateTicketPdf, useSummarizeTicket, useTicketSummary } from '../hooks/use-tickets';
import { useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import { FileUploader } from './file-uploader';
import { TicketComments } from './ticket-comments';
import { FileText, Download, ExternalLink, Printer, FileDown, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface TicketDetailProps {
  id: string;
}

export const TicketDetail = ({ id }: TicketDetailProps) => {
  const { data: ticket, isLoading: loadingTicket } = useTicket(id);
  const { data: history, isLoading: loadingHistory } = useTicketHistory(id);
  const { data: documents, isLoading: loadingDocs } = useTicketDocuments(id);
  const { data: aiSummary } = useTicketSummary(id);
  const { data: states } = useWorkflowStates();
  const changeStatus = useChangeTicketStatus(id);
  const generatePdf = useGenerateTicketPdf(id);
  const summarize = useSummarizeTicket(id);

  if (loadingTicket || loadingHistory || loadingDocs) {
    return <div className="p-8 text-center">Cargando detalles del ticket...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Ticket no encontrado.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 block">Volver al Dashboard</Link>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  return (
    <div className="space-y-6">
      {/* Header con Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 block">← Volver al Dashboard</Link>
          <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">{ticket.categoryName}</span>
            <span className={`px-2 py-1 text-xs font-bold rounded-md ${
              ticket.statusName === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
              ticket.statusName === 'CANCELADO' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {ticket.statusName}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Acciones</label>
          <div className="flex gap-2">
            <select
              value={ticket.workflowStateId}
              onChange={(e) => changeStatus.mutate(e.target.value)}
              disabled={changeStatus.isPending}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 bg-white disabled:opacity-50 text-sm"
            >
              {states?.map((state) => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => generatePdf.mutate()}
              disabled={generatePdf.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {generatePdf.isPending ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-8">
              {ticket.description || 'Sin descripción proporcionada.'}
            </p>

            <hr className="my-6 border-gray-100" />

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Archivos Adjuntos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {documents?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                  </div>
                  <a 
                    href={`${API_URL}${doc.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
              {(!documents || documents.length === 0) && (
                <p className="text-sm text-gray-500 col-span-2 italic">No hay archivos adjuntos.</p>
              )}
            </div>

            <FileUploader ticketId={id} />
          </div>

          {/* Resumen IA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Resumen Inteligente</h3>
              </div>
              <button
                onClick={() => summarize.mutate()}
                disabled={summarize.isPending}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
              >
                {summarize.isPending ? 'Generando...' : 'Actualizar resumen'}
              </button>
            </div>
            
            {aiSummary ? (
              <p className="text-sm text-gray-700 leading-relaxed italic">
                "{aiSummary}"
              </p>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">¿Necesitas un resumen rápido de la conversación?</p>
                <button
                  onClick={() => summarize.mutate()}
                  disabled={summarize.isPending}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {summarize.isPending ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generar Resumen con IA
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <TicketComments ticketId={id} />
          </div>
        </div>

        {/* Historial (Timeline) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Historial de Cambios</h3>
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {history?.map((item, index) => (
              <div key={item.id} className="relative flex items-start group">
                <div className="absolute left-0 mt-1.5 w-10 flex justify-center">
                  <div className={`h-3 w-3 rounded-full border-2 border-white shadow-sm ${index === 0 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'}`}></div>
                </div>
                <div className="ml-12">
                  <p className="text-xs text-gray-500 mb-1">{new Date(item.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-medium text-gray-900">
                    Estado cambiado a <span className="text-blue-600">{states?.find(s => s.id === item.newStateId)?.name}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Por: {item.user?.name || item.user?.email || 'Sistema'}
                  </p>
                </div>
              </div>
            ))}
            {(!history || history.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">Sin historial registrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
