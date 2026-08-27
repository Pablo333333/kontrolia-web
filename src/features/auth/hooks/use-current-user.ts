'use client';

import { useEffect, useState } from 'react';
import { AuthUser, getStoredUser } from '../utils/roles';

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return user;
}
