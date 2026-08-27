'use client';

import { FormEvent, useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useCreateSubcategory,
  useTeamSettings,
  useUpdateTeamSettings,
  useDocumentFolders,
  useCreateFolder,
  useMyPreferences,
  useUpdateMyPreferences,
} from '@/features/catalog/hooks/use-catalog';
import { catalogService } from '@/features/catalog/services/catalog.service';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { isManager } from '@/features/auth/utils/roles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, FolderPlus, Tags, Image as ImageIcon, UserCog } from 'lucide-react';
import { useEffect } from 'react';

export default function ConfiguracionPage() {
  const user = useCurrentUser();
  const manager = isManager(user);
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const { data: settings } = useTeamSettings();
  const { data: folders } = useDocumentFolders();
  const { data: prefs } = useMyPreferences();
  const createCategory = useCreateCategory();
  const createSubcategory = useCreateSubcategory();
  const updateSettings = useUpdateTeamSettings();
  const updatePrefs = useUpdateMyPreferences();
  const createFolder = useCreateFolder();

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [subName, setSubName] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [folderName, setFolderName] = useState('');
  const [message, setMessage] = useState('');
  const [searchMode, setSearchMode] = useState('semantic');
  const [defaultInboxView, setDefaultInboxView] = useState('active');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [accentColor, setAccentColor] = useState('#2563eb');

  useEffect(() => {
    if (!prefs) return;
    setSearchMode(prefs.searchMode || 'semantic');
    setDefaultInboxView(prefs.defaultInboxView || 'active');
    setNotifyEmail(prefs.notifyEmail);
    setNotifyPush(prefs.notifyPush);
    setNotifyWhatsApp(prefs.notifyWhatsApp);
    setAccentColor(prefs.accentColor || '#2563eb');
  }, [prefs]);

  const deleteCategory = useMutation({
    mutationFn: (id: string) => catalogService.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  // Operadores también pueden editar preferencias personales más abajo

  const handleSaveBranding = (e: FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(
      {
        displayName: displayName || settings?.displayName,
        logoUrl: logoUrl || settings?.logoUrl,
        primaryColor: primaryColor || settings?.primaryColor,
      },
      { onSuccess: () => setMessage('Identidad del grupo actualizada') },
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personalización</h1>
          <p className="text-gray-600">Categorías, subcategorías, logo y carpetas del grupo activo</p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <UserCog size={18} /> Mis preferencias personales
          </h2>
          <p className="text-xs text-gray-500">
            Ajustes individuales de {user?.name || user?.email || 'tu cuenta'} (no afectan al resto del equipo).
          </p>
          <form
            className="grid md:grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              updatePrefs.mutate(
                {
                  searchMode,
                  defaultInboxView,
                  notifyEmail,
                  notifyPush,
                  notifyWhatsApp,
                  accentColor,
                },
                { onSuccess: () => setMessage('Preferencias personales guardadas') },
              );
            }}
          >
            <label className="text-sm space-y-1">
              <span className="font-medium text-gray-700">Modo de búsqueda</span>
              <select value={searchMode} onChange={(e) => setSearchMode(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="semantic">Contextual / semántica</option>
                <option value="literal">Literal (palabra exacta)</option>
              </select>
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium text-gray-700">Bandeja por defecto</span>
              <select value={defaultInboxView} onChange={(e) => setDefaultInboxView(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="active">Activos</option>
                <option value="historical">Histórico</option>
              </select>
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium text-gray-700">Color de acento</span>
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-10 border rounded-lg" />
            </label>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} /> Notificaciones push</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} /> Alertas por correo</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifyWhatsApp} onChange={(e) => setNotifyWhatsApp(e.target.checked)} /> Alertas WhatsApp</label>
            </div>
            <button type="submit" className="md:col-span-2 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium">
              Guardar mis preferencias
            </button>
          </form>
        </section>

        {manager ? (
        <>
        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Palette size={18} /> Identidad del equipo / grupo activo
          </h2>
          <p className="text-xs text-gray-500">
            Grupo actual: {settings?.displayName || '—'} ({settings?.groupIdentifier || '—'})
          </p>
          <form onSubmit={handleSaveBranding} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Nombre visible"
              defaultValue={settings?.displayName || ''}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="URL del logo"
              defaultValue={settings?.logoUrl || ''}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-gray-400" />
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-16 border rounded"
              />
              <span className="text-sm text-gray-600">{primaryColor}</span>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
              Guardar identidad
            </button>
          </form>
        </section>

        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Tags size={18} /> Categorías y subcategorías
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form
              className="space-y-2 border rounded-lg p-3"
              onSubmit={(e) => {
                e.preventDefault();
                createCategory.mutate(
                  { name: catName, description: catDesc },
                  {
                    onSuccess: () => {
                      setCatName('');
                      setCatDesc('');
                      setMessage('Categoría creada');
                    },
                  },
                );
              }}
            >
              <p className="text-sm font-medium">Nueva categoría</p>
              <input required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Nombre" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Descripción" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm">Crear categoría</button>
            </form>

            <form
              className="space-y-2 border rounded-lg p-3"
              onSubmit={(e) => {
                e.preventDefault();
                createSubcategory.mutate(
                  { name: subName, categoryId: subCategoryId },
                  {
                    onSuccess: () => {
                      setSubName('');
                      setMessage('Subcategoría creada');
                    },
                  },
                );
              }}
            >
              <p className="text-sm font-medium">Nueva subcategoría</p>
              <select required value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Categoría padre...</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input required value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Nombre subcategoría" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm">Crear subcategoría</button>
            </form>
          </div>

          <ul className="divide-y border rounded-lg">
            {categories?.map(cat => (
              <li key={cat.id} className="p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-gray-500 text-xs">{cat.description}</p>
                    {cat.subcategories?.length ? (
                      <p className="text-xs text-blue-700 mt-1">
                        Subs: {cat.subcategories.map((s: any) => s.name).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => {
                      if (confirm(`¿Eliminar categoría ${cat.name}?`)) deleteCategory.mutate(cat.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FolderPlus size={18} /> Carpetas de archivos del grupo
          </h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              createFolder.mutate(
                { name: folderName },
                {
                  onSuccess: () => {
                    setFolderName('');
                    setMessage('Carpeta creada');
                  },
                },
              );
            }}
          >
            <input
              required
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Ej: Planos, Contratos, Evidencias"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
              Crear carpeta
            </button>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(folders || []).map(folder => (
              <div key={folder.id} className="border rounded-lg px-3 py-2 text-sm flex justify-between">
                <span>{folder.name}</span>
                <span className="text-gray-400">{folder._count?.documents ?? 0} docs</span>
              </div>
            ))}
            {(!folders || folders.length === 0) && (
              <p className="text-sm text-gray-500">Aún no hay carpetas. Crea la primera arriba.</p>
            )}
          </div>
        </section>
        </>
        ) : (
          <p className="text-sm text-gray-500 bg-white border rounded-xl p-4">
            Las categorías, logo y carpetas del equipo las configura un administrador o supervisor.
            Tus preferencias personales ya están disponibles arriba.
          </p>
        )}
      </div>
    </main>
  );
}
