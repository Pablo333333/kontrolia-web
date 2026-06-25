'use client';

import React, { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TicketResponse } from '../types';
import { useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import { useTickets, useChangeTicketStatus } from '../hooks/use-tickets';
import Link from 'next/link';

interface KanbanColumnProps {
  id: string;
  title: string;
  tickets: TicketResponse[];
}

const KanbanCard = ({ ticket }: { ticket: TicketResponse }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: {
      type: 'Ticket',
      ticket,
    },
  });

  const priorityColors = {
    URGENTE: 'border-l-4 border-l-red-500 bg-red-50',
    MEDIA: 'border-l-4 border-l-yellow-500 bg-yellow-50',
    BAJA: 'border-l-4 border-l-green-500 bg-green-50',
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 mb-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${priorityColors[ticket.priority] || 'bg-white'}`}
    >
      <Link href={`/tickets/${ticket.id}`} className="block" onClick={(e) => e.stopPropagation()}>
        <h4 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
          {ticket.title}
        </h4>
      </Link>
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          <span className="text-[10px] px-1.5 py-0.5 bg-white/50 text-gray-600 rounded border border-gray-200">
            {ticket.categoryName}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            ticket.priority === 'URGENTE' ? 'bg-red-100 text-red-700' :
            ticket.priority === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {ticket.priority}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const KanbanColumn = ({ id, title, tickets }: KanbanColumnProps) => {
  const { setNodeRef } = useSortable({
    id,
    data: {
      type: 'Column',
    },
  });

  return (
    <div className="flex flex-col w-80 bg-gray-100 rounded-xl p-4 min-h-[500px] border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">
          {title}
        </h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
          {tickets.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex-1">
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <KanbanCard key={ticket.id} ticket={ticket} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const KanbanBoard = () => {
  const { data: states } = useWorkflowStates();
  const { data: tickets, isLoading } = useTickets();
  const changeStatusMutation = useChangeTicketStatus();

  const [activeTicket, setActiveTicket] = React.useState<TicketResponse | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(() => {
    if (!states || !tickets) return [];
    
    // Filtrar tickets archivados (CERRADOS)
    const activeTickets = tickets.filter(t => !t.isArchived);
    
    return states
      .filter(state => state.name !== 'CERRADO') // No mostrar columna CERRADO en el Kanban activo
      .map(state => ({
        id: state.id,
        title: state.name,
        tickets: activeTickets.filter(t => t.workflowStateId === state.id)
      }));
  }, [states, tickets]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets?.find(t => t.id === active.id);
    if (ticket) setActiveTicket(ticket);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const activeTicketId = active.id as string;
    const overId = over.id as string;

    // Encontrar el ticket y el estado de destino
    const ticket = tickets?.find(t => t.id === activeTicketId);
    if (!ticket) return;

    // Si soltamos sobre una columna o sobre un ticket en otra columna
    let newStateId = overId;
    const overTicket = tickets?.find(t => t.id === overId);
    if (overTicket) {
      newStateId = overTicket.workflowStateId;
    }

    if (ticket.workflowStateId !== newStateId) {
      changeStatusMutation.mutate({ id: activeTicketId, newStateId });
    }
  };

  if (isLoading) return <div className="p-8 text-center">Cargando tablero...</div>;

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tickets={column.tickets}
          />
        ))}
        <DragOverlay>
          {activeTicket ? (
            <div className="p-4 bg-white rounded-lg shadow-xl border-2 border-blue-500 w-72 rotate-3 opacity-90">
              <h4 className="font-semibold text-gray-900">{activeTicket.title}</h4>
              <p className="text-xs text-gray-500 mt-2">{activeTicket.categoryName}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
