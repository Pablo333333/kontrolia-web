export type AppRole = 'ADMIN' | 'SUPERVISOR' | 'OPERARIO';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: AppRole | string;
};

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getRole(user?: AuthUser | null): AppRole | null {
  const role = (user ?? getStoredUser())?.role?.toUpperCase();
  if (role === 'ADMIN' || role === 'SUPERVISOR' || role === 'OPERARIO') {
    return role;
  }
  return null;
}

export function isAdmin(user?: AuthUser | null): boolean {
  return getRole(user) === 'ADMIN';
}

export function isManager(user?: AuthUser | null): boolean {
  const role = getRole(user);
  return role === 'ADMIN' || role === 'SUPERVISOR';
}

export function isOperario(user?: AuthUser | null): boolean {
  return getRole(user) === 'OPERARIO';
}

export function getRoleLabel(user?: AuthUser | null): string {
  const role = getRole(user);
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'SUPERVISOR':
      return 'Supervisor';
    case 'OPERARIO':
      return 'Operador';
    default:
      return 'Usuario';
  }
}
