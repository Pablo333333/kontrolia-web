import api from '@/lib/api';
import {
  CreateTicketDto,
  TicketResponse,
  TicketHistoryResponse,
  DocumentResponse,
  CommentResponse,
  TicketStatsResponse,
} from '../types';

export type TicketFilters = {
  categoryId?: string;
  subcategoryId?: string;
  workflowStateId?: string;
  priority?: string;
  messageType?: string;
  userId?: string;
  destinatarioId?: string;
  q?: string;
  includeArchived?: boolean;
  includeDocuments?: boolean;
  includeLastResponse?: boolean;
  limit?: number;
  offset?: number;
};

export const ticketsService = {
  create: async (data: CreateTicketDto): Promise<TicketResponse> => {
    const response = await api.post<TicketResponse>('/tickets', data);
    return response.data;
  },
  findAll: async (filters?: TicketFilters): Promise<TicketResponse[]> => {
    const params: Record<string, string> = {};
    if (filters?.categoryId) params.categoryId = filters.categoryId;
    if (filters?.subcategoryId) params.subcategoryId = filters.subcategoryId;
    if (filters?.workflowStateId) params.workflowStateId = filters.workflowStateId;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.messageType) params.messageType = filters.messageType;
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.destinatarioId) params.destinatarioId = filters.destinatarioId;
    if (filters?.q) params.q = filters.q;
    if (filters?.includeArchived) params.includeArchived = 'true';
    if (filters?.includeDocuments) params.includeDocuments = 'true';
    if (filters?.includeLastResponse === false) params.includeLastResponse = 'false';
    if (filters?.limit != null) params.limit = String(filters.limit);
    if (filters?.offset != null) params.offset = String(filters.offset);
    const response = await api.get<TicketResponse[]>('/tickets', { params });
    return response.data;
  },
  findById: async (id: string): Promise<TicketResponse> => {
    const response = await api.get<TicketResponse>(`/tickets/${id}`);
    return response.data;
  },
  getHistory: async (id: string): Promise<TicketHistoryResponse[]> => {
    const response = await api.get<TicketHistoryResponse[]>(`/tickets/${id}/history`);
    return response.data;
  },
  changeStatus: async (id: string, newStateId: string): Promise<void> => {
    await api.patch(`/tickets/${id}/status`, { newStateId });
  },
  uploadDocument: async (id: string, file: File): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<DocumentResponse>(`/tickets/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getDocuments: async (id: string): Promise<DocumentResponse[]> => {
    const response = await api.get<DocumentResponse[]>(`/tickets/${id}/documents`);
    return response.data;
  },
  getStats: async (): Promise<TicketStatsResponse> => {
    const response = await api.get<TicketStatsResponse>('/tickets/stats');
    return response.data;
  },
  getComments: async (id: string): Promise<CommentResponse[]> => {
    const response = await api.get<CommentResponse[]>(`/tickets/${id}/comments`);
    return response.data;
  },
  createComment: async (id: string, content: string): Promise<CommentResponse> => {
    const response = await api.post<CommentResponse>(`/tickets/${id}/comments`, { content });
    return response.data;
  },
  generatePdf: async (id: string): Promise<Blob> => {
    const response = await api.get(`/tickets/${id}/generate-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  summarize: async (id: string): Promise<{ summary: string }> => {
    const response = await api.post<{ summary: string }>(`/tickets/${id}/summarize`);
    return response.data;
  },
  search: async (params: {
    q: string;
    mode?: 'literal' | 'semantic';
    includeArchived?: boolean;
    limit?: number;
  }): Promise<TicketResponse[]> => {
    const response = await api.get<TicketResponse[]>('/tickets/search', {
      params: {
        q: params.q,
        mode: params.mode ?? 'semantic',
        ...(params.includeArchived ? { includeArchived: 'true' } : {}),
        ...(params.limit != null ? { limit: String(params.limit) } : {}),
      },
    });
    return response.data;
  },
};
