import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Excluir explícitamente recursos estáticos y archivos internos de Next.js
  if (
    pathname.startsWith('/_next') || // Archivos internos de Next.js
    pathname.startsWith('/api') ||   // Rutas de API (manejadas por el backend o Next API)
    pathname.includes('.') ||        // Archivos con extensión (favicon.ico, manifest.json, etc.)
    pathname === '/service-worker.js'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  console.log(`[Middleware] Path: ${pathname}, Token: ${token ? 'Present' : 'Missing'}`);

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  // Si no hay token y la ruta no es pública, redirigir a /login
  if (!token && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si hay token e intenta ir a login/register, redirigir a dashboard
  if (token && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configurar en qué rutas se debe ejecutar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
