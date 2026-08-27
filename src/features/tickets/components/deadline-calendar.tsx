'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TicketResponse } from '../types';

interface DeadlineCalendarProps {
  tickets: TicketResponse[];
  onSelectTicket?: (ticket: TicketResponse) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function DeadlineCalendar({ tickets, onSelectTicket }: DeadlineCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const ticketsWithDeadline = useMemo(
    () => tickets.filter(t => t.fechaLimite && !t.isArchived),
    [tickets],
  );

  const ticketsByDay = useMemo(() => {
    const map = new Map<string, TicketResponse[]>();
    for (const ticket of ticketsWithDeadline) {
      const key = new Date(ticket.fechaLimite!).toDateString();
      const list = map.get(key) ?? [];
      list.push(ticket);
      map.set(key, list);
    }
    return map;
  }, [ticketsWithDeadline]);

  const calendarDays = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const startOffset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      const key = day.toDateString();
      return {
        date: day,
        inMonth: day.getMonth() === currentMonth.getMonth(),
        tickets: ticketsByDay.get(key) ?? [],
      };
    });
  }, [currentMonth, ticketsByDay]);

  const selectedTickets = useMemo(() => {
    if (!selectedDate) return [];
    return ticketsByDay.get(selectedDate.toDateString()) ?? [];
  }, [selectedDate, ticketsByDay]);

  const monthLabel = currentMonth.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-bold capitalize text-gray-900">{monthLabel}</h2>
        <button
          type="button"
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
        {calendarDays.map(({ date, inMonth, tickets: dayTickets }) => {
          const isToday = sameDay(date, new Date());
          const isSelected = selectedDate ? sameDay(date, selectedDate) : false;
          const hasOverdue = dayTickets.some(t => new Date(t.fechaLimite!) < new Date());

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`min-h-[72px] rounded-lg border p-1 text-left transition-colors ${
                inMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                {date.getDate()}
              </span>
              {dayTickets.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  <span
                    className={`block text-[10px] font-bold px-1 rounded ${
                      hasOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {dayTickets.length} venc.
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          {selectedDate
            ? `Trámites del ${selectedDate.toLocaleDateString('es-ES')}`
            : 'Selecciona un día para ver los trámites'}
        </h3>
        {selectedDate && selectedTickets.length === 0 && (
          <p className="text-sm text-gray-500">No hay fechas límite en este día.</p>
        )}
        <div className="space-y-2">
          {selectedTickets.map(ticket => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              onClick={() => onSelectTicket?.(ticket)}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">{ticket.title}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                new Date(ticket.fechaLimite!) < new Date()
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {ticket.statusName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
