import { TicketDashboard } from '@/features/tickets/components/ticket-dashboard';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <TicketDashboard />
      </div>
    </main>
  );
}
