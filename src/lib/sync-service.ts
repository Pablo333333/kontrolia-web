import { db } from './db';
import { ticketsService } from '@/features/tickets/services/tickets.service';

export const syncService = {
  syncTickets: async () => {
    const offlineTickets = await db.tickets.where('synced').equals(0).toArray();
    
    if (offlineTickets.length === 0) return;

    console.log(`Sincronizando ${offlineTickets.length} tickets offline...`);

    for (const ticket of offlineTickets) {
      try {
        const { id, synced, createdAt, ...dto } = ticket;
        await ticketsService.create(dto);
        await db.tickets.update(ticket.id!, { synced: true });
        console.log(`Ticket ${ticket.title} sincronizado.`);
      } catch (error) {
        console.error(`Error sincronizando ticket ${ticket.title}:`, error);
      }
    }
  },

  init: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Conexión recuperada. Iniciando sincronización...');
        syncService.syncTickets();
      });
    }
  }
};
