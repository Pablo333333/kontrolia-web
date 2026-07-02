# 1. Base image
FROM node:20-alpine AS base

# 2. Dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# Usamos npm install si no hay lockfile, o npm ci si lo hay
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Seguridad: No correr como root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios del builder
# El standalone incluye node_modules y el servidor mínimo
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

# Railway asigna el puerto dinámicamente, pero Next standalone usa 3000 por defecto
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# El server.js generado por standalone está en la raíz de .next/standalone
CMD ["node", "server.js"]
