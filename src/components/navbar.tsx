'use client';

import Link from 'next/link';
import { SearchBar } from './search-bar';
import { NotificationBell } from './notification-bell';
import { User, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600 flex-shrink-0">
            KONTROLIA
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600">Tickets</Link>
            <Link href="/dashboard/analytics" className="text-sm font-medium text-gray-600 hover:text-blue-600">Analítica</Link>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 hidden md:flex justify-center">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <NotificationBell />
          
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
