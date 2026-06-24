'use client';

import { useTicketStats } from '../hooks/use-tickets';
import { useCategories } from '@/features/catalog/hooks/use-catalog';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { AlertCircle, Clock, CheckCircle2, ListTodo } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AnalyticsDashboard = () => {
  const { data: stats, isLoading } = useTicketStats();
  const { data: categories } = useCategories();

  if (isLoading) return <div className="p-8 text-center text-gray-500">Analizando datos...</div>;

  // Preparar datos para Pie Chart (Categorías)
  const categoryData = stats?.byCategory.map((item: any) => ({
    name: categories?.find(c => c.id === item.categoryId)?.name || 'Desconocida',
    value: item._count._all
  })) || [];

  // Preparar datos para Bar Chart (Carga de trabajo)
  const workloadData = stats?.byUser.map((item: any) => ({
    name: item.userId.substring(0, 8), // Simplificado
    tickets: item._count._all
  })) || [];

  // Preparar datos para Line Chart (Últimos 7 días)
  // Nota: Esto es una simplificación, en producción se agruparía por fecha real
  const evolutionData = [
    { name: 'Día 1', creados: 4, cerrados: 2 },
    { name: 'Día 2', creados: 3, cerrados: 3 },
    { name: 'Día 3', creados: 8, cerrados: 4 },
    { name: 'Día 4', creados: 5, cerrados: 7 },
    { name: 'Día 5', creados: 9, cerrados: 5 },
    { name: 'Día 6', creados: 2, cerrados: 8 },
    { name: 'Día 7', creados: 6, cerrados: 4 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Analítica de KONTROLIA</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg"><AlertCircle className="text-red-600 h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Urgentes</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><ListTodo className="text-blue-600 h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pendientes</p>
            <p className="text-2xl font-bold text-gray-900">45</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><CheckCircle2 className="text-green-600 h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completados</p>
            <p className="text-2xl font-bold text-gray-900">128</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg"><Clock className="text-indigo-600 h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tiempo Promedio</p>
            <p className="text-2xl font-bold text-gray-900">4.2h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución por Categoría */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Categoría</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carga de Trabajo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Carga de Trabajo por Usuario</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolución Temporal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolución de Tickets (Últimos 7 días)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="creados" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cerrados" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
