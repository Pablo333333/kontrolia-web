'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useCategories, useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import { useCreateTicket } from '../hooks/use-tickets';

const ticketSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  categoryId: z.string().uuid('Selecciona una categoría válida'),
  workflowStateId: z.string().uuid('Selecciona un estado válido'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export const CreateTicketForm = () => {
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: states, isLoading: loadingStates } = useWorkflowStates();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
  });

  const createTicket = useCreateTicket({
    onSuccess: () => {
      reset();
      alert('Ticket creado con éxito');
    },
  });

  // Capturar geolocalización al cargar el componente
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          console.log('Ubicación capturada:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error capturando ubicación:', error.message);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [setValue]);

  const onSubmit = (data: TicketFormValues) => {
    createTicket.mutate(data);
  };

  if (loadingCats || loadingStates) {
    return <div className="p-4 text-center">Cargando catálogos...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Ticket</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            {...register('title')}
            className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
              errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
            }`}
            placeholder="Ej: Error en la carga de documentos"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
            placeholder="Describe el problema o solicitud..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Selecciona una categoría</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Inicial</label>
            <select
              {...register('workflowStateId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Selecciona un estado</option>
              {states?.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.workflowStateId && <p className="mt-1 text-xs text-red-600">{errors.workflowStateId.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={createTicket.isPending}
          className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {createTicket.isPending ? 'Creando ticket...' : 'Crear Ticket'}
        </button>
      </form>
    </div>
  );
};
