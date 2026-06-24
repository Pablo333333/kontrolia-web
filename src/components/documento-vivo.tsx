'use client';

import React, { useState, useEffect } from 'react';
import { 
  useTicketComments, useCreateComment, useTicketDocuments, useUploadDocument, useSummarizeTicket, useTicketSummary, useTicketHistory 
} from '@/features/tickets/hooks/use-tickets';
import { 
  useTramiteComments, useCreateTramiteComment, useTramiteDocuments, useUploadTramiteDocument, useSummarizeTramite, useTramiteSummary 
} from '@/features/tramites/hooks/use-tramites';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Paperclip, Sparkles, History, MessageSquare, FileText } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentoVivoProps {
  entityId: string;
  entityType: 'TICKET' | 'TRAMITE';
}

export const DocumentoVivo: React.FC<DocumentoVivoProps> = ({ entityId, entityType }) => {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('joinRoom', { roomId: entityId });
    });

    socket.on('messageReceived', (comment) => {
      console.log('New message received via socket:', comment);
      // Invalidar las queries de comentarios para refrescar la UI
      if (entityType === 'TICKET') {
        queryClient.invalidateQueries({ queryKey: ['ticket-comments', entityId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['tramite-comments', entityId] });
      }
    });

    socket.on('statusChanged', (data) => {
      console.log('Status changed via socket:', data);
      // Invalidar queries de historial y detalle
      if (entityType === 'TICKET') {
        queryClient.invalidateQueries({ queryKey: ['ticket', entityId] });
        queryClient.invalidateQueries({ queryKey: ['ticket-history', entityId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['tramite', entityId] });
      }
    });

    return () => {
      socket.emit('leaveRoom', { roomId: entityId });
      socket.disconnect();
    };
  }, [entityId, entityType, queryClient]);

  // Hooks condicionales basados en el tipo de entidad
  const isTicket = entityType === 'TICKET';
  
  const commentsQuery = isTicket ? useTicketComments(entityId) : useTramiteComments(entityId);
  const createCommentMutation = isTicket ? useCreateComment(entityId) : useCreateTramiteComment(entityId);
  
  const documentsQuery = isTicket ? useTicketDocuments(entityId) : useTramiteDocuments(entityId);
  const uploadDocumentMutation = isTicket ? useUploadDocument(entityId) : useUploadTramiteDocument(entityId);
  
  const summarizeMutation = isTicket ? useSummarizeTicket(entityId) : useSummarizeTramite(entityId);
  const summaryQuery = isTicket ? useTicketSummary(entityId) : useTramiteSummary(entityId);

  // El historial por ahora solo está implementado para tickets en el backend con su propio hook
  // Para trámites podríamos añadirlo luego o usar una interfaz común
  const historyQuery = isTicket ? useTicketHistory(entityId) : { data: [], isLoading: false };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment, {
      onSuccess: () => setNewComment(''),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadDocumentMutation.mutate(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel de Resumen IA */}
      <Card className="border-sparkles bg-sparkles/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Resumen Inteligente
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => summarizeMutation.mutate()}
            disabled={summarizeMutation.isPending}
          >
            {summarizeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar Resumen'}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            {summaryQuery.data || "Haz clic en 'Actualizar Resumen' para que la IA analice este documento vivo."}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comments" className="flex gap-2">
            <MessageSquare className="h-4 w-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex gap-2">
            <FileText className="h-4 w-4" /> Archivos
          </TabsTrigger>
          <TabsTrigger value="history" className="flex gap-2">
            <History className="h-4 w-4" /> Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4 mt-4">
          <div className="max-h-[400px] overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/30">
            {commentsQuery.isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : commentsQuery.data?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay mensajes aún. ¡Inicia la conversación!</p>
            ) : (
              commentsQuery.data?.map((comment: any) => (
                <div key={comment.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">{comment.user?.name || 'Usuario'}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="bg-background p-3 rounded-lg border text-sm shadow-sm">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea 
              placeholder="Escribe un mensaje..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex flex-col gap-2">
              <Button size="icon" onClick={handleSendComment} disabled={createCommentMutation.isPending}>
                {createCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
              <label className="cursor-pointer">
                <Button size="icon" variant="outline" asChild>
                  <span><Paperclip className="h-4 w-4" /></span>
                </Button>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadDocumentMutation.isPending} />
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentsQuery.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : documentsQuery.data?.length === 0 ? (
              <p className="col-span-2 text-center text-muted-foreground py-8">No hay archivos adjuntos.</p>
            ) : (
              documentsQuery.data?.map((doc: any) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-8 w-8 text-primary shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</p>
                        {doc.extractedText && (
                          <Badge variant="secondary" className="mt-1 text-[10px] py-0 px-1">OCR Disponible</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noreferrer">Ver</a>
                      </Button>
                      {doc.extractedText && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => alert(`Texto Extraído:\n\n${doc.extractedText}`)}
                        >
                          Leer OCR
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-[10px]"
                        onClick={async () => {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit/verify/${entityId}`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                          });
                          const data = await res.json();
                          alert(data.isValid ? '✅ Integridad Verificada: La cadena de hashes es válida y el registro no ha sido manipulado.' : '❌ Error de Integridad: Se detectó una discrepancia en la cadena de hashes.');
                        }}
                      >
                        Verificar Blockchain
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-4">
            {historyQuery.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : historyQuery.data?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay historial registrado.</p>
            ) : (
              historyQuery.data?.map((entry: any) => (
                <div key={entry.id} className="flex gap-4 border-l-2 border-muted ml-2 pl-4 pb-4 last:pb-0">
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">
                      Cambio de estado: <Badge variant="outline">{entry.oldStateName || 'Inicio'}</Badge> → <Badge>{entry.newStateName}</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Por {entry.userName} el {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
