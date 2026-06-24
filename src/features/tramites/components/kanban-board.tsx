'use client';

import React, { useMemo, useState } from 'react';
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
import { useTramites, useChangeTramiteStatus } from '../hooks/use-tramites';
import { useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, GripVertical, FileText, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface KanbanItemProps {
  id: string;
  title: string;
  sender: string;
  date: string;
  type: string;
}

const KanbanItem = ({ id, title, sender, date, type }: KanbanItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-3 group">
      <Card className="hover:border-primary transition-colors shadow-sm">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{type}</span>
            </div>
            <div {...listeners} className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Link href={`/tramites/${id}`} className="block">
            <Text style={{ fontWeight: 'bold' }} className="text-sm hover:text-primary hover:underline line-clamp-2">
              {title}
            </Text>
          </Link>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{sender}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{new Date(date).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface KanbanColumnProps {
  id: string;
  title: string;
  items: any[];
}

const KanbanColumn = ({ id, title, items }: KanbanColumnProps) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div className="flex flex-col w-full min-w-[280px] bg-muted/30 rounded-xl p-3 h-full max-h-[calc(100vh-250px)]">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-sm flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
        </h3>
      </div>
      
      <div ref={setNodeRef} className="flex-1 overflow-y-auto pr-1">
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanItem 
              key={item.id} 
              id={item.id} 
              title={`${item.tipo} - ${item.destinatarioName}`}
              sender={item.remitenteName}
              date={item.createdAt}
              type={item.tipo}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const KanbanBoard = () => {
  const { data: tramites, isLoading: loadingTramites } = useTramites();
  const { data: states, isLoading: loadingStates } = useWorkflowStates();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const changeStatus = useChangeTramiteStatus(activeId || '');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = useMemo(() => {
    if (!states || !tramites) return [];
    return states.map(state => ({
      ...state,
      items: tramites.filter(t => t.estadoId === state.id)
    }));
  }, [states, tramites]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = tramites?.find(t => t.id === active.id);
    const overColumnId = over.id as string;

    // Si soltamos sobre una columna diferente a la actual
    if (activeItem && activeItem.estadoId !== overColumnId) {
      changeStatus.mutate(overColumnId);
    }

    setActiveId(null);
  };

  if (loadingTramites || loadingStates) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="w-full h-full overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 min-h-[500px]">
          {columns.map(col => (
            <KanbanColumn key={col.id} id={col.id} title={col.name} items={col.items} />
          ))}
        </div>
        
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId ? (
            <div className="w-[260px] rotate-3">
              <Card className="border-primary shadow-xl">
                <CardContent className="p-3">
                  <p className="text-sm font-bold">Moviendo trámite...</p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// Helper component for text wrapping in Next.js/Tailwind context
const Text = ({ children, style, className }: any) => <span style={style} className={className}>{children}</span>;
