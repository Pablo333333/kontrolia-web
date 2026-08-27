'use client';

import { useMemo, useState } from 'react';
import {
  useCategories,
  useRepoDocuments,
  useDocumentFolders,
} from '@/features/catalog/hooks/use-catalog';
import { useTickets, useUploadDocument } from '@/features/tickets/hooks/use-tickets';
import { catalogService } from '@/features/catalog/services/catalog.service';
import { FileText, Search, Download, ExternalLink, Folder, Plus, X, Upload, FileSpreadsheet, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function DocumentosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingTicketId, setUploadingTicketId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const queryParams = useMemo(() => ({
    q: searchTerm || undefined,
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    folderId: selectedFolder === 'all' ? undefined : selectedFolder,
  }), [searchTerm, selectedCategory, selectedFolder]);

  const { data: documents, isLoading, refetch } = useRepoDocuments(queryParams);
  const { data: categories } = useCategories();
  const { data: folders } = useDocumentFolders();
  const { data: tickets } = useTickets({ limit: 50 });
  const uploadMutation = useUploadDocument(uploadingTicketId);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadingTicketId) return;

    uploadMutation.mutate(selectedFile, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setUploadingTicketId('');
        refetch();
        alert('Documento subido con éxito');
      },
    });
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(format);
      const blob = await catalogService.exportDocuments(format, queryParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kontrolia-documentos.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('No se pudo exportar. Intenta nuevamente.');
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando repositorio...</div>;
  }

  const docs = documents ?? [];

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Repositorio Central</h1>
            <p className="text-gray-600">Explora, filtra y exporta documentos consolidados</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              disabled={exporting !== null}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium inline-flex items-center gap-2"
            >
              <FileSpreadsheet size={16} />
              {exporting === 'csv' ? 'Exportando...' : 'Exportar CSV'}
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium inline-flex items-center gap-2"
            >
              <FileDown size={16} />
              {exporting === 'pdf' ? 'Exportando...' : 'Exportar PDF'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm flex items-center gap-2"
            >
              <Plus size={18} />
              Subir Documento
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por archivo o mensaje..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
            >
              <option value="all">Todas las categorías</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
            >
              <option value="all">Todas las carpetas</option>
              {folders?.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">
            Total: {docs.length} archivos
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-center h-32 relative">
                <FileText size={48} className="text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 gap-2">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full shadow-sm text-blue-600 hover:text-blue-700">
                    <ExternalLink size={18} />
                  </a>
                  <a href={doc.url} download className="p-2 bg-white rounded-full shadow-sm text-green-600 hover:text-green-700">
                    <Download size={18} />
                  </a>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-gray-900 truncate" title={doc.name}>{doc.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Folder size={12} />
                  <span className="truncate">{doc.folderName || doc.categoryName || 'Sin carpeta'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText size={12} />
                  {doc.ticketId ? (
                    <Link href={`/tickets/${doc.ticketId}`} className="truncate hover:text-blue-600 hover:underline">
                      {doc.ticketTitle}
                    </Link>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="pt-2 flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-50">
                  <span>v{doc.version}</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {docs.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No se encontraron documentos con los filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Subir Documento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asociar a mensaje</label>
                <select
                  required
                  value={uploadingTicketId}
                  onChange={(e) => setUploadingTicketId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
                >
                  <option value="">Selecciona un mensaje...</option>
                  {tickets?.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>{selectedFile ? selectedFile.name : 'Selecciona un archivo'}</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={uploadMutation.isPending || !selectedFile || !uploadingTicketId}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Subiendo...' : 'Subir Documento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
