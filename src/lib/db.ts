import Dexie, { Table } from 'dexie';
import { CreateTicketDto } from '@/features/tickets/types';

export interface OfflineTicket extends CreateTicketDto {
  id?: number;
  createdAt: number;
  synced: boolean;
}

export class KontroliaDB extends Dexie {
  tickets!: Table<OfflineTicket>;

  constructor() {
    super('KontroliaDB');
    this.version(1).stores({
      tickets: '++id, synced, createdAt'
    });
  }
}

export const db = new KontroliaDB();
