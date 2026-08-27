'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [semantic, setSemantic] = useState(true);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const mode = semantic ? 'semantic' : 'literal';
    router.push(`/?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={semantic ? 'Buscar por sentido o palabras...' : 'Buscar por palabra exacta...'}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      <button
        type="button"
        title={semantic ? 'Búsqueda contextual activa' : 'Búsqueda literal'}
        onClick={() => setSemantic((v) => !v)}
        className={`shrink-0 p-2 rounded-full border transition-colors ${
          semantic
            ? 'bg-violet-100 border-violet-300 text-violet-700'
            : 'bg-white border-gray-200 text-gray-500'
        }`}
      >
        <Sparkles className="h-4 w-4" />
      </button>
    </form>
  );
};
