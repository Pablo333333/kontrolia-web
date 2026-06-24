'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWorkflowStates } from '@/features/catalog/hooks/use-catalog';
import { useCreateTramite, useAnalyzeTramiteImage } from '../hooks/use-tramites';
import { TramiteType } from '../services/tramites.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';

const tramiteSchema = z.object({
  tipo: z.nativeEnum(TramiteType),
  destinatarioId: z.string().uuid('Selecciona un destinatario válido'),
  estadoId: z.string().uuid('Selecciona un estado válido'),
  fechaLimite: z.string().optional(),
});

type TramiteFormValues = z.infer<typeof tramiteSchema>;

export const CreateTramiteForm = () => {
  const router = useRouter();
  const { data: states, isLoading: loadingStates } = useWorkflowStates();
  const analyzeImage = useAnalyzeTramiteImage();
  
  // ... mockUsers ...
  const mockUsers = [
    { id: 'user-1', name: 'Admin Central' },
    { id: 'user-2', name: 'Supervisor de Obra' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TramiteFormValues>({
    resolver: zodResolver(tramiteSchema),
    defaultValues: {
      tipo: TramiteType.SOLICITUD,
    }
  });

  const createTramite = useCreateTramite({
    onSuccess: () => {
      router.push('/tramites');
    },
  });

  const handleAiAutofill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      analyzeImage.mutate(file, {
        onSuccess: (data) => {
          if (data.tipo) setValue('tipo', data.tipo as TramiteType);
          // En un sistema real, buscaríamos el ID del estado por nombre
          if (data.prioridad === 'URGENTE') {
            // Lógica para asignar estado o prioridad si existiera el campo
          }
          alert(`IA analizó el documento:\n\nTipo: ${data.tipo}\nResumen: ${data.resumen}`);
        }
      });
    }
  };

  const onSubmit = (data: TramiteFormValues) => {
    createTramite.mutate(data);
  };

  if (loadingStates) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Crear Nuevo Trámite</CardTitle>
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-sparkles text-primary flex gap-2"
            disabled={analyzeImage.isPending}
            asChild
          >
            <label className="cursor-pointer">
              {analyzeImage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Autocompletar con IA
              <input type="file" className="hidden" onChange={handleAiAutofill} accept="image/*,application/pdf" />
            </label>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Documento</label>
              <select
                {...register('tipo')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.values(TramiteType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado Inicial</label>
              <select
                {...register('estadoId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecciona un estado</option>
                {states?.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              {errors.estadoId && <p className="text-xs text-red-500">{errors.estadoId.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Destinatario</label>
            <select
              {...register('destinatarioId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Selecciona un destinatario</option>
              {/* En producción esto vendría de un useUsers() */}
              {mockUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.destinatarioId && <p className="text-xs text-red-500">{errors.destinatarioId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha Límite (Opcional)</label>
            <input
              type="date"
              {...register('fechaLimite')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <Button type="submit" className="w-full" disabled={createTramite.isPending}>
            {createTramite.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Registrar Trámite'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
