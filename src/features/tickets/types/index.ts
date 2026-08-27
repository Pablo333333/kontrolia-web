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
  categoryName?: string;
}

export type Priority = 'BAJA' | 'MEDIA' | 'URGENTE';

export interface TicketDashboardStats {
  nuevos: number;
  enProceso: number;
  completados: number;
  cerrados: number;
  cancelados: number;
  vencidos: number;
  overdue: number;
  pending: number;
  nuevosTemas: number;
  continuaciones: number;
}

export interface TicketStatsResponse {
  dashboard: TicketDashboardStats;
  kpis: {
    total: number;
    pending: number;
    completed: number;
    urgent: number;
    avgResponseHours?: number;
  };
  byCategory: { name: string; value: number }[];
  byUser: { name: string; tickets: number }[];
  bySender?: { name: string; value: number }[];
  byRecipient?: { name: string; value: number }[];
  byLocation?: { name: string; value: number }[];
  byPriority: { name: string; value: number }[];
  byMessageType: { name: string; value: number }[];
  evolution: { name: string; date?: string; creados: number; cerrados: number }[];
  avgResponseHours?: number;
}

export interface TicketResponse {
  id: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  categoryId: string;
  subcategoryId?: string | null;
  subcategoryName?: string | null;
  workflowStateId: string;
  userId: string;
  destinatarioId?: string | null;
  priority: Priority;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  statusName?: string;
  remitenteName?: string;
  destinatarioName?: string;
  messageType?: string;
  tramiteSubtype?: string;
  responseUrgency?: string;
  fechaLimite?: string;
  locationLabel?: string;
  parentTicketId?: string;
  rootTicketId?: string;
  isContinuation?: boolean;
  lastResponseContent?: string | null;
  lastResponseAt?: string | null;
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
  subcategoryId?: string;
  workflowStateId: string;
  destinatarioId?: string;
  messageType?: string;
  tramiteSubtype?: string;
  responseUrgency?: string;
  priority?: Priority;
  fechaLimite?: string;
  locationLabel?: string;
  parentTicketId?: string;
}
