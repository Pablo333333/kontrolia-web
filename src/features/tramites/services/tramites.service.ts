import api from '@/lib/api';

export enum TramiteType {
  SOLICITUD = 'SOLICITUD',
  CARTA = 'CARTA',
  OFICIO = 'OFICIO',
  INFORME = 'INFORME',
}

export interface TramiteResponse {
  id: string;
  tipo: TramiteType;
  remitenteId: string;
  destinatarioId: string;
  estadoId: string;
  latitude?: number;
  longitude?: number;
  fechaLimite?: string;
  createdAt: string;
  updatedAt: string;
  remitenteName?: string;
  destinatarioName?: string;
  estadoName?: string;
}

export interface CreateTramiteDto {
  tipo: TramiteType;
  destinatarioId: string;
  estadoId: string;
  latitude?: number;
  longitude?: number;
  fechaLimite?: string;
}

export const tramitesService = {
  create: async (data: CreateTramiteDto): Promise<TramiteResponse> => {
    const response = await api.post<TramiteResponse>('/tramites', data);
    return response.data;
  },
  findAll: async (filters?: { q?: string }): Promise<TramiteResponse[]> => {
    const response = await api.get<TramiteResponse[]>('/tramites', { params: filters });
    return response.data;
  },
  findById: async (id: string): Promise<TramiteResponse> => {
    const response = await api.get<TramiteResponse>(`/tramites/${id}`);
    return response.data;
  },
  changeStatus: async (id: string, newStateId: string): Promise<void> => {
    await api.patch(`/tramites/${id}/status`, { newStateId });
  },
  uploadDocument: async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tramites/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getDocuments: async (id: string): Promise<any[]> => {
    const response = await api.get(`/tramites/${id}/documents`);
    return response.data;
  },
  getComments: async (id: string): Promise<any[]> => {
    const response = await api.get(`/tramites/${id}/comments`);
    return response.data;
  },
  createComment: async (id: string, content: string): Promise<any> => {
    const response = await api.post(`/tramites/${id}/comments`, { content });
    return response.data;
  },
  summarize: async (id: string): Promise<{ summary: string }> => {
    const response = await api.get<{ summary: string }>(`/tramites/${id}/summary`);
    return response.data;
  },
  analyzeImage: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/tramites/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
