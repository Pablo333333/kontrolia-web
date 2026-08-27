'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsDashboard } from '@/features/tickets/components/analytics-dashboard';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { isManager } from '@/features/auth/utils/roles';

export default function AnalyticsPage() {
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (user && !isManager(user)) {
      router.replace('/');
    }
  }, [user, router]);

  if (user && !isManager(user)) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <p className="text-center text-gray-600">Acceso restringido a administradores y supervisores.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <AnalyticsDashboard />
      </div>
    </main>
  );
}
