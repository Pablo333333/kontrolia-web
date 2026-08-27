'use client';

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTramites } from '@/features/tramites/hooks/use-tramites';
import { useTickets } from '@/features/tickets/hooks/use-tickets';
import { useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Filter, MapPin } from 'lucide-react';
import { DocumentoVivo } from '@/components/documento-vivo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Corregir iconos de Leaflet en Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const TicketIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const TramiteIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Helper Button component
const Button = ({ children, className, size, ...props }: any) => (
  <button 
    className={`bg-primary text-primary-foreground rounded-md px-3 py-1 font-medium hover:opacity-90 transition-opacity ${className}`} 
    {...props}
  >
    {children}
  </button>
);

export default function MapContent() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: tramites, isLoading: loadingTramites } = useTramites();
  const { data: tickets, isLoading: loadingTickets } = useTickets();
  const { data: states } = useWorkflowStates();

  const allMarkers = useMemo(() => {
    const tramiteMarkers = (tramites || [])
      .filter(t => t.latitude && t.longitude)
      .map(t => ({ ...t, markerType: 'TRAMITE' as const }));
    
    const ticketMarkers = (tickets || [])
      .filter(t => t.latitude && t.longitude)
      .map(t => ({ ...t, markerType: 'TICKET' as const }));

    return [...tramiteMarkers, ...ticketMarkers].filter(m => {
      if (!statusFilter) return true;
      if (m.markerType === 'TRAMITE') return (m as any).estadoId === statusFilter;
      if (m.markerType === 'TICKET') return (m as any).workflowStateId === statusFilter;
      return true;
    });
  }, [tramites, tickets, statusFilter]);

  if (loadingTramites || loadingTickets) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" /> Geolocalización de Tareas
        </h1>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border-none focus:ring-0"
          >
            <option value="">Todos los estados</option>
            {states?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border shadow-inner mx-4 mb-4">
        <MapContainer 
          center={[-12.046374, -77.042793]} // Lima, Perú como default
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {allMarkers.map((marker) => (
            <Marker 
              key={`${marker.markerType}-${marker.id}`} 
              position={[marker.latitude!, marker.longitude!]}
              icon={marker.markerType === 'TICKET' ? TicketIcon : TramiteIcon}
            >
              <Popup className="min-w-[300px]">
                <div className="space-y-3 p-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={marker.markerType === 'TICKET' ? 'default' : 'secondary'}>
                      {marker.markerType === 'TICKET' ? 'Mensaje' : 'Trámite'}
                    </Badge>
                    <Badge variant="outline">
                      {marker.markerType === 'TICKET' 
                        ? (marker as any).statusName 
                        : (marker as any).estadoName}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm">
                    {marker.markerType === 'TICKET' 
                      ? (marker as any).title 
                      : `${(marker as any).tipo} - ${(marker as any).destinatarioName}`}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {marker.markerType === 'TICKET' 
                      ? (marker as any).description 
                      : 'Sin descripción adicional'}
                  </p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="w-full text-[10px] h-7">Ver Documento Vivo</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Documento Vivo: {marker.markerType === 'TICKET' ? (marker as any).title : (marker as any).tipo}
                        </DialogTitle>
                      </DialogHeader>
                      <DocumentoVivo entityId={marker.id} entityType={marker.markerType} />
                    </DialogContent>
                  </Dialog>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
