'use client';

import { useState } from 'react';
import { useTicketComments, useCreateComment } from '../hooks/use-tickets';
import { Send, User as UserIcon } from 'lucide-react';

interface TicketCommentsProps {
  ticketId: string;
}

export const TicketComments = ({ ticketId }: TicketCommentsProps) => {
  const [content, setContent] = useState('');
  const { data: comments, isLoading } = useTicketComments(ticketId);
  const createComment = useCreateComment(ticketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment.mutate(content, {
      onSuccess: () => setContent(''),
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Conversación</h3>
      
      {/* Lista de Comentarios */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center">Cargando comentarios...</p>
        ) : comments?.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 italic">No hay comentarios aún. ¡Sé el primero en escribir!</p>
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-900">{comment.user?.name || comment.user?.email}</span>
                  <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario de Comentario */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un mensaje..."
          rows={2}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-none text-sm transition-all"
        />
        <button
          type="submit"
          disabled={createComment.isPending || !content.trim()}
          className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
