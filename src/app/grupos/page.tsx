'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useWorkGroups, useCreateWorkGroup, useSetActiveWorkGroup } from '@/features/work-groups/hooks/use-work-groups';
import { workGroupsService } from '@/features/work-groups/services/work-groups.service';
import { useCategories, useUsers } from '@/features/catalog/hooks/use-catalog';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { isManager } from '@/features/auth/utils/roles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, FolderKanban, Plus, Phone, Mail } from 'lucide-react';

export default function WorkGroupsPage() {
  const user = useCurrentUser();
  const manager = isManager(user);
  const qc = useQueryClient();
  const { data: groups, isLoading } = useWorkGroups();
  const { data: categories } = useCategories();
  const { data: users } = useUsers();
  const createGroup = useCreateWorkGroup();
  const setActive = useSetActiveWorkGroup();

  const [selectedId, setSelectedId] = useState<string>('');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [description, setDescription] = useState('');
  const [memberUserId, setMemberUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const selected = useMemo(
    () => groups?.find(g => g.id === selectedId) || groups?.[0],
    [groups, selectedId],
  );

  const addMember = useMutation({
    mutationFn: () => workGroupsService.addMember(selected!.id, memberUserId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['work-groups'] });
      setMemberUserId('');
      setMessage('Integrante agregado');
    },
  });

  const saveTopics = useMutation({
    mutationFn: () => workGroupsService.assignTopics(selected!.id, topicIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['work-groups'] });
      setMessage('Temas asignados al grupo');
    },
  });

  const savePhone = useMutation({
    mutationFn: () => workGroupsService.updateContact(phone),
    onSuccess: () => setMessage('Teléfono WhatsApp actualizado'),
  });

  const runDigest = useMutation({
    mutationFn: () => workGroupsService.runDigest(),
    onSuccess: (data: any) =>
      setMessage(`Digest enviado: ${data.recipients} destinatarios, ${data.pending} pendientes`),
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createGroup.mutate(
      { name, identifier, description },
      {
        onSuccess: (g) => {
          setSelectedId(g.id);
          setName('');
          setIdentifier('');
          setDescription('');
          setMessage(`Grupo ${g.name} creado`);
        },
      },
    );
  };

  if (!manager) {
    return (
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-xl mx-auto bg-white border rounded-xl p-8 text-center">
          <p className="text-gray-600">Solo administradores y supervisores gestionan grupos de trabajo.</p>
          <div className="mt-6 space-y-3 text-left">
            <label className="block text-sm font-medium text-gray-700">Tu teléfono WhatsApp (E.164)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+51999999999"
              className="w-full border rounded-lg px-3 py-2"
            />
            <button
              type="button"
              onClick={() => savePhone.mutate()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Guardar contacto
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grupos de trabajo</h1>
            <p className="text-gray-600">Proyectos, integrantes y temas asignados</p>
          </div>
          <button
            type="button"
            onClick={() => runDigest.mutate()}
            className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2"
          >
            <Mail size={16} />
            Ejecutar digest ahora
          </button>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white border rounded-xl p-4 space-y-2">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FolderKanban size={18} /> Grupos
              </h2>
              {isLoading ? (
                <p className="text-sm text-gray-500">Cargando...</p>
              ) : (
                groups?.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(g.id);
                      setTopicIds(g.topics.map(t => t.category.id));
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border ${
                      selected?.id === g.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-500">{g.identifier} · {g._count?.members ?? g.members.length} miembros</p>
                  </button>
                ))
              )}
            </div>

            <form onSubmit={handleCreate} className="bg-white border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Plus size={16} /> Nuevo grupo / proyecto
              </h3>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Proyecto 1"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="PROYECTO-1"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
              <button
                type="submit"
                disabled={createGroup.isPending}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                Crear grupo
              </button>
            </form>

            <div className="bg-white border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Phone size={16} /> Mi WhatsApp
              </h3>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51999999999"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => savePhone.mutate()}
                className="w-full py-2 border border-gray-300 rounded-lg text-sm"
              >
                Guardar teléfono
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <div className="bg-white border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                      <p className="text-sm text-gray-500">{selected.identifier}</p>
                      {selected.description && (
                        <p className="text-sm text-gray-600 mt-2">{selected.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActive.mutate(selected.id)}
                      className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
                    >
                      Usar como activo
                    </button>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users size={16} /> Integrantes
                  </h3>
                  <ul className="divide-y">
                    {selected.members.map(m => (
                      <li key={m.id} className="py-2 flex justify-between text-sm">
                        <span>
                          {m.user.name || m.user.email}
                          <span className="text-gray-400"> · {m.user.role}</span>
                        </span>
                        <span className="text-xs font-bold text-blue-700">{m.roleInGroup}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <select
                      value={memberUserId}
                      onChange={(e) => setMemberUserId(e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Agregar usuario...</option>
                      {users?.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!memberUserId || addMember.isPending}
                      onClick={() => addMember.mutate()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold">Temas / categorías asignados</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories?.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2">
                        <input
                          type="checkbox"
                          checked={topicIds.includes(cat.id)}
                          onChange={(e) => {
                            setTopicIds(prev =>
                              e.target.checked
                                ? [...prev, cat.id]
                                : prev.filter(id => id !== cat.id),
                            );
                          }}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => saveTopics.mutate()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    Guardar temas
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
                Crea o selecciona un grupo para gestionarlo.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
