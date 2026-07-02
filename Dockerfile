# 1. Base image
FROM node:20-alpine AS base

# 2. Dependencias
FROM base AS deps
# Instalamos dependencias necesarias para algunos paquetes nativos
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos los archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Usamos npm install en lugar de npm ci para ser más tolerantes con el lockfile
# y permitir que npm lo sincronice si es necesario durante el build.
RUN npm install

# 3. Builder
FROM base AS builder
WORKDIR /app
# Copiamos node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
# Copiamos el resto del código fuente
COPY . .

# Deshabilitamos telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Ejecutamos el build de producción
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Configuramos usuario de seguridad no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos los archivos generados en modo standalone
# El modo standalone de Next.js empaqueta solo lo necesario para correr el servidor
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

# Configuración de red para Railway
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El servidor standalone de Next.js genera un server.js en la raíz del output
CMD ["node", "server.js"]
