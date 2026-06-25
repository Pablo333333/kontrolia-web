export interface CommentResponse {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  createdAt: string;
  user?: {
    name?: string;
    email: string;
  };
}

export interface DocumentResponse {
  id: string;
  name: string;
  url: string;
  type?: string;
  version: number;
  isLatest: boolean;
  userId: string;
  ticketId?: string;
  createdAt: string;
  categoryName?: string; // Para el explorador de documentos
}

export type Priority = 'BAJA' | 'MEDIA' | 'URGENTE';

export interface TicketResponse {
  id: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  categoryId: string;
  workflowStateId: string;
  userId: string;
  priority: Priority;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  statusName?: string;
  documents?: DocumentResponse[];
}

export interface TicketHistoryResponse {
  id: string;
  ticketId: string;
  oldStateId?: string;
  newStateId: string;
  userId: string;
  timestamp: string;
  user?: {
    name?: string;
    email: string;
  };
}

export interface CreateTicketDto {
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  categoryId: string;
  workflowStateId: string;
}
