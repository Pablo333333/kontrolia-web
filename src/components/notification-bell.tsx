'use client';

import { Bell } from 'lucide-react';

export const NotificationBell = () => {
  return (
    <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
      <Bell className="h-5 w-5" />
      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
    </button>
  );
};
