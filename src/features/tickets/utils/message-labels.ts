import { TicketResponse } from '../types';

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  COORDINACION: 'Coordinación',
  TRAMITE: 'Trámite',
  DOCUMENTOS_TECNICOS: 'Documentos técnicos',
  CONVENIOS: 'Convenios',
};

const TRAMITE_SUBTYPE_LABELS: Record<string, string> = {
  CARTA: 'Carta',
  OFICIO: 'Oficio',
  SOLICITUD: 'Solicitud',
};

const RESPONSE_URGENCY_LABELS: Record<string, string> = {
  MOMENTO: 'Para el momento',
  DIA: 'Para el día',
  DOS_DIAS: 'Para 2 días',
  MAS_DOS_DIAS: 'Después de 2 días',
};

export function formatTramiteType(ticket: Pick<TicketResponse, 'messageType' | 'tramiteSubtype' | 'title'>): string {
  if (ticket.tramiteSubtype) {
    return TRAMITE_SUBTYPE_LABELS[ticket.tramiteSubtype] ?? ticket.tramiteSubtype;
  }
  if (ticket.messageType) {
    return MESSAGE_TYPE_LABELS[ticket.messageType] ?? ticket.messageType;
  }
  const title = ticket.title?.toLowerCase() ?? '';
  if (title.includes('oficio')) return 'Oficio';
  if (title.includes('carta')) return 'Carta';
  if (title.includes('convenio')) return 'Convenios';
  if (title.includes('técnic') || title.includes('tecnico')) return 'Documentos técnicos';
  return 'Solicitud';
}

export function formatResponseUrgency(urgency?: string | null): string {
  if (!urgency) return '—';
  return RESPONSE_URGENCY_LABELS[urgency] ?? urgency;
}

export function isTramiteTicket(ticket: Pick<TicketResponse, 'categoryName' | 'title' | 'messageType'>): boolean {
  return (
    ticket.categoryName === 'DOCUMENTACIÓN' ||
    ticket.messageType === 'TRAMITE' ||
    (ticket.title?.toLowerCase().includes('trámite') ?? false)
  );
}

export function isHistoricalTicket(ticket: Pick<TicketResponse, 'statusName' | 'isArchived'>): boolean {
  const status = ticket.statusName?.toUpperCase() ?? '';
  return status === 'CERRADO' || ticket.isArchived;
}
