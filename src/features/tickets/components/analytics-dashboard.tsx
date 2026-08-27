'use client';

import { useTicketStats } from '../hooks/use-tickets';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { AlertCircle, Clock, CheckCircle2, ListTodo, Timer } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0891b2', '#ea580c'];

export const AnalyticsDashboard = () => {
  const { data: stats, isLoading } = useTicketStats();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-100"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] bg-white rounded-xl border border-gray-200"></div>
          <div className="h-[400px] bg-white rounded-xl border border-gray-200"></div>
        </div>
      </div>
    );
  }

  const dashboard = stats?.dashboard;
  const categoryData = stats?.byCategory || [];
  const senderData = stats?.bySender || (stats?.byUser || []).map(u => ({ name: u.name, value: u.tickets }));
  const recipientData = stats?.byRecipient || [];
  const locationData = stats?.byLocation || [];
  const evolutionData = stats?.evolution || [];
  const priorityData = stats?.byPriority || [];
  const messageTypeData = stats?.byMessageType || [];
  const avgResponseHours = stats?.avgResponseHours ?? stats?.kpis?.avgResponseHours ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Analítica de CONECTA</h1>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado de los mensajes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg"><ListTodo className="text-yellow-600 h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Nuevos</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.nuevos ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><Clock className="text-blue-600 h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">En proceso</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.enProceso ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><CheckCircle2 className="text-green-600 h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Completados</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.completados ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg"><AlertCircle className="text-red-600 h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Vencidos</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.vencidos ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-lg"><CheckCircle2 className="text-stone-600 h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Cerrados</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.cerrados ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg"><AlertCircle className="text-orange-600 h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Cancelados</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.cancelados ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg"><ListTodo className="text-indigo-600 h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Nuevos temas</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.nuevosTemas ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-violet-100 rounded-lg"><Timer className="text-violet-600 h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tiempo promedio de respuesta</p>
              <p className="text-2xl font-bold text-gray-900">{avgResponseHours} h</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg"><AlertCircle className="text-red-600 h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Urgentes</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.kpis?.urgent || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><ListTodo className="text-blue-600 h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pendientes</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.kpis?.pending || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><CheckCircle2 className="text-green-600 h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completados (KPI)</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.kpis?.completed || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg"><Clock className="text-indigo-600 h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total activos</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.kpis?.total || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  nameKey="name"
                >
                  {categoryData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Por tipo de mensaje</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messageTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Mensajes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Por remitente</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={senderData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Mensajes" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Por destinatario</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recipientData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Mensajes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Por ubicación geográfica</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" name="Mensajes" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Por prioridad</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {priorityData.map((_entry: any, index: number) => (
                    <Cell key={`prio-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolución de Mensajes (Últimos 7 días)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="creados" name="Creados" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cerrados" name="Cerrados" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
