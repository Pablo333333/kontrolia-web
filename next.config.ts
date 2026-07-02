import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true, // Útil para despliegues en contenedores sin optimizador de imágenes nativo
  },
  experimental: {
    // Si usas App Router y quieres mejorar el rendimiento de carga
    // ppr: true, 
  }
};

export default nextConfig;
