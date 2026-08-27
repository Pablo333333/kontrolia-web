import Dexie, { Table } from 'dexie';
import { CreateTicketDto } from '@/features/tickets/types';

export interface OfflineTicket extends CreateTicketDto {
  id?: number;
  createdAt: number;
  synced: boolean;
}

export class ConectaDB extends Dexie {
  tickets!: Table<OfflineTicket>;

  constructor() {
    super('ConectaDB');
    this.version(1).stores({
      tickets: '++id, synced, createdAt'
    });
  }
}

export const db = typeof window !== 'undefined' ? new ConectaDB() : null as any;
