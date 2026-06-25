import { CreateTicketForm } from '@/features/tickets/components/create-ticket-form';
import { Suspense } from 'react';

export default function CreateTicketPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Suspense fallback={<div className="text-center p-12">Cargando formulario...</div>}>
        <CreateTicketForm />
      </Suspense>
    </main>
  );
}
