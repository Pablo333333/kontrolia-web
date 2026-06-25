'use client';

import { useState, useMemo } from 'react';
import { useTickets, useUploadDocument } from '@/features/tickets/hooks/use-tickets';
import { useCategories } from '@/features/catalog/hooks/use-catalog';
import { FileText, Search, Filter, Download, ExternalLink, Folder, Plus, X, Upload } from 'lucide-react';
import Link from 'next/link';

export default function DocumentosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingTicketId, setUploadingTicketId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { data: tickets, isLoading: isLoadingTickets } = useTickets();
  const { data: categories } = useCategories();
  const uploadMutation = useUploadDocument(uploadingTicketId);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadingTicketId) return;

    uploadMutation.mutate(selectedFile, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setUploadingTicketId('');
        alert('Documento subido con éxito');
      },
    });
  };

  // Extraer todos los documentos de todos los tickets
  const allDocuments = useMemo(() => {
    if (!tickets) return [];
    
    const docs: any[] = [];
    tickets.forEach(ticket => {
      if (ticket.documents) {
        ticket.documents.forEach((doc: any) => {
          docs.push({
            ...doc,
            ticketTitle: ticket.title,
            categoryName: ticket.categoryName,
            categoryId: ticket.categoryId
          });
        });
      }
    });
    return docs;
  }, [tickets]);

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.ticketTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.categoryId === selectedCategory;
      return matchesSearch && matchesCategory && doc.isLatest;
    });
  }, [allDocuments, searchTerm, selectedCategory]);

  if (isLoadingTickets) return <div className="p-8 text-center">Cargando repositorio...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Repositorio Central</h1>
            <p className="text-gray-600">Explora y gestiona todos los documentos del sistema</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Subir Documento
          </button>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre de archivo o ticket..."
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
          <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">
            Total: {filteredDocuments.length} archivos
          </div>
        </div>

        {/* Grid de Archivos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => (
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
                  <span className="truncate">{doc.categoryName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText size={12} />
                  <Link href={`/tickets/${doc.ticketId}`} className="truncate hover:text-blue-600 hover:underline">
                    {doc.ticketTitle}
                  </Link>
                </div>
                <div className="pt-2 flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-50">
                  <span>v{doc.version}</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredDocuments.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No se encontraron documentos con los filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Subida */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Asociar a Ticket</label>
                <select
                  required
                  value={uploadingTicketId}
                  onChange={(e) => setUploadingTicketId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white"
                >
                  <option value="">Selecciona un ticket...</option>
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
                    <p className="text-xs text-gray-500">PDF, PNG, JPG hasta 10MB</p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={uploadMutation.isPending || !selectedFile || !uploadingTicketId}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {uploadMutation.isPending ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
