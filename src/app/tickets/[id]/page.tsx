import { TicketDetail } from '@/features/tickets/components/ticket-detail';
import { use } from 'react';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <TicketDetail id={id} />
      </div>
    </main>
  );
}
