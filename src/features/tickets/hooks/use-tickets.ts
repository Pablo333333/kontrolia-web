import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ticketsService } from '../services/tickets.service';
import { CreateTicketDto } from '../types';
import { db } from '@/lib/db';

export const useCreateTicket = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketDto) => {
      if (!navigator.onLine) {
        console.log('Modo offline detectado. Guardando ticket localmente...');
        await db.tickets.add({
          ...data,
          createdAt: Date.now(),
          synced: false,
        });
        return { offline: true };
      }
      return ticketsService.create(data);
    },
    onSuccess: (data: any) => {
      // Invalidar la caché de tickets para refrescar cualquier listado
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      if (options?.onSuccess) {
        options.onSuccess();
      }
      if (data?.offline) {
        alert('Estás offline. El ticket se guardó localmente y se sincronizará cuando recuperes la conexión.');
      }
    },
  });
};

export const useTickets = (filters?: { categoryId?: string; workflowStateId?: string; q?: string }) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsService.findAll(filters),
  });
};

export const useTicketStats = () => {
  return useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: ticketsService.getStats,
    staleTime: 0, // Forzar datos frescos
    refetchOnWindowFocus: true,
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketsService.findById(id),
    enabled: !!id,
  });
};

export const useTicketHistory = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id, 'history'],
    queryFn: () => ticketsService.getHistory(id),
    enabled: !!id,
  });
};

export const useChangeTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newStateId }: { id: string; newStateId: string }) => 
      ticketsService.changeStatus(id, newStateId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id, 'history'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useTicketDocuments = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id, 'documents'],
    queryFn: () => ticketsService.getDocuments(id),
    enabled: !!id,
  });
};

export const useUploadDocument = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => ticketsService.uploadDocument(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id, 'documents'] });
    },
  });
};

export const useTicketComments = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id, 'comments'],
    queryFn: () => ticketsService.getComments(id),
    enabled: !!id,
  });
};

export const useCreateComment = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => ticketsService.createComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id, 'comments'] });
    },
  });
};

export const useGenerateTicketPdf = (id: string) => {
  return useMutation({
    mutationFn: () => ticketsService.generatePdf(id),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};

export const useSummarizeTicket = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ticketsService.summarize(id),
    onSuccess: (data) => {
      // Podríamos guardar el resumen en la caché del ticket
      queryClient.setQueryData(['tickets', id, 'summary'], data.summary);
    },
  });
};

export const useTicketSummary = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id, 'summary'],
    queryFn: () => null, // El resumen se genera bajo demanda
    enabled: false,
  });
};
