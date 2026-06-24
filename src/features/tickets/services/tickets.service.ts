import api from '@/lib/api';
import { CreateTicketDto, TicketResponse } from '../types';

export const ticketsService = {
  create: async (data: CreateTicketDto): Promise<TicketResponse> => {
    const response = await api.post<TicketResponse>('/tickets', data);
    return response.data;
  },
  findAll: async (filters?: { categoryId?: string; workflowStateId?: string }): Promise<TicketResponse[]> => {
    const response = await api.get<TicketResponse[]>('/tickets', { params: filters });
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
  getStats: async (): Promise<any> => {
    const response = await api.get('/tickets/stats');
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
};
