'use client';

import { useParams } from 'next/navigation';
import { useTicket, useTicketComments, useTicketHistory, useTicketDocuments, useCreateComment, useChangeTicketStatus, useUploadDocument } from '../hooks/use-tickets';
import { useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import { useState } from 'react';
import { MessageSquare, Paperclip, History, Clock, User, ChevronRight, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

export const TicketDetail = () => {
  const { id } = useParams();
  const ticketId = id as string;

  const { data: ticket, isLoading: isLoadingTicket } = useTicket(ticketId);
  const { data: comments, isLoading: isLoadingComments } = useTicketComments(ticketId);
  const { data: history, isLoading: isLoadingHistory } = useTicketHistory(ticketId);
  const { data: documents, isLoading: isLoadingDocs } = useTicketDocuments(ticketId);
  const { data: states } = useWorkflowStates();

  const createCommentMutation = useCreateComment(ticketId);
  const changeStatusMutation = useChangeTicketStatus();
  const uploadDocumentMutation = useUploadDocument(ticketId);

  const [newComment, setNewComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    uploadDocumentMutation.mutate(file, {
      onSuccess: () => {
        setIsUploading(false);
        e.target.value = ''; // Reset input
      },
      onError: () => setIsUploading(false),
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment, {
      onSuccess: () => setNewComment(''),
    });
  };

  const handleStatusChange = (newStateId: string) => {
    changeStatusMutation.mutate({ id: ticketId, newStateId });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date(ticket.createdAt).toLocaleDateString();
    
    // Configuración de estilo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("KONTROLIA - DOCUMENTO FORMAL", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${date}`, 20, 40);
    doc.text(`Ticket ID: ${ticket.id}`, 20, 50);
    
    doc.line(20, 55, 190, 55);
    
    doc.setFont("helvetica", "bold");
    doc.text("ASUNTO:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(ticket.title.toUpperCase(), 45, 70);
    
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCIÓN:", 20, 85);
    doc.setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(ticket.description || "Sin descripción", 170);
    doc.text(splitDescription, 20, 95);
    
    doc.setFont("helvetica", "bold");
    doc.text("CATEGORÍA:", 20, 150);
    doc.setFont("helvetica", "normal");
    doc.text(ticket.categoryName || "N/A", 50, 150);
    
    doc.setFont("helvetica", "bold");
    doc.text("ESTADO ACTUAL:", 20, 160);
    doc.setFont("helvetica", "normal");
    doc.text(ticket.statusName || "N/A", 60, 160);
    
    doc.line(20, 250, 80, 250);
    doc.text("Firma Responsable", 35, 260);
    
    doc.save(`Ticket_${ticket.id.substring(0, 8)}.pdf`);
  };

  if (isLoadingTicket) return <div className="p-8 text-center">Cargando ticket...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket no encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">Tickets</Link>
            <ChevronRight size={14} />
            <span>{ticket.id.substring(0, 8)}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <FileText size={18} className="text-blue-600" />
            Generar Documento
          </button>
          <select
            value={ticket.workflowStateId}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-2 rounded-lg font-semibold outline-none border-2 transition-all text-gray-900 bg-white ${
              ticket.statusName === 'COMPLETADO' ? 'bg-green-50 border-green-200 text-green-700' :
              ticket.statusName === 'CANCELADO' ? 'bg-red-50 border-red-200 text-red-700' :
              'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            {states?.map((state) => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Descripción */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              Descripción
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {ticket.description || 'Sin descripción proporcionada.'}
            </p>
          </section>

          {/* Comentarios */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" />
              Comentarios
            </h3>
            
            <div className="space-y-6 mb-8">
              {comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{comment.user?.name || 'Usuario'}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
              {comments?.length === 0 && (
                <p className="text-center text-gray-500 py-4">No hay comentarios aún.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-gray-900 bg-white"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={createCommentMutation.isPending || !newComment.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Archivos Adjuntos */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Paperclip size={20} className="text-blue-600" />
                Documentos
              </h3>
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                {isUploading ? 'Subiendo...' : 'Subir'}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </div>
            <div className="space-y-3">
              {documents?.filter((d: any) => d.isLatest).map((doc: any) => (
                <div key={doc.id} className="space-y-1">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="p-2 bg-gray-100 rounded group-hover:bg-white transition-colors">
                      <FileText size={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">v{doc.version}</span>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </a>
                  {/* Historial de versiones si existen */}
                  {documents?.some((d: any) => d.name === doc.name && !d.isLatest) && (
                    <details className="ml-4">
                      <summary className="text-[10px] text-blue-600 cursor-pointer hover:underline">Ver versiones anteriores</summary>
                      <div className="mt-2 space-y-2">
                        {documents
                          .filter((d: any) => d.name === doc.name && !d.isLatest)
                          .sort((a: any, b: any) => b.version - a.version)
                          .map((oldDoc: any) => (
                            <a
                              key={oldDoc.id}
                              href={oldDoc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded border border-dashed border-gray-200 hover:bg-gray-50 text-xs text-gray-500"
                            >
                              <FileText size={12} />
                              <span className="flex-1 truncate">{oldDoc.name}</span>
                              <span>v{oldDoc.version}</span>
                            </a>
                          ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
              {documents?.length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay archivos adjuntos.</p>
              )}
            </div>
          </section>

          {/* Historial */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <History size={20} className="text-blue-600" />
              Trazabilidad
            </h3>
            <div className="space-y-4">
              {history?.map((entry: any) => (
                <div key={entry.id} className="flex gap-3 text-sm">
                  <div className="mt-1">
                    <Clock size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700">
                      <span className="font-bold">{entry.user?.name || 'Usuario'}</span> cambió el estado
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                        {entry.oldStateName || 'Inicio'}
                      </span>
                      <ChevronRight size={12} className="text-gray-300" />
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                        {entry.newStateName}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {history?.length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay historial registrado.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

import Link from 'next/link';
