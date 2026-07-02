'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MapContent = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

export default function MapPage() {
  return <MapContent />;
}
