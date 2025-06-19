# Imagen base para desarrollo
FROM node:18-alpine AS base
WORKDIR /app

# Etapa 1: Construir el módulo compartido
FROM base AS shared-builder
WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/ ./
# Compilar el módulo compartido
RUN npm run build
# Verificar el contenido del directorio dist
RUN ls -la dist/

# Etapa 2: Construir el backend
FROM base AS backend-builder
# Crear la misma estructura de directorios que en desarrollo
WORKDIR /app
# Copiar el módulo compartido completo (fuente y compilado)
COPY --from=shared-builder /app/shared /app/shared
# Movernos al directorio del backend
WORKDIR /app/backend
# Copiar package.json y instalar dependencias
COPY backend/package*.json ./
RUN npm install
# Copiar el código fuente del backend
COPY backend/ ./
# Copiar archivo de variables de entorno para Docker
COPY backend/.env.docker ./.env
# Compilar el backend
RUN npm run build
# Verificar el resultado de la compilación
RUN ls -la dist/

# Etapa 3: Construir el frontend
FROM base AS frontend-builder
# Crear la misma estructura de directorios que en desarrollo
WORKDIR /app
# Copiar el módulo compartido completo (fuente y compilado)
COPY --from=shared-builder /app/shared /app/shared
# Movernos al directorio del frontend
WORKDIR /app/frontend
# Copiar package.json y instalar dependencias
COPY frontend/package*.json ./
RUN npm install
# Copiar el código fuente del frontend
COPY frontend/ ./
# Copiar archivo de variables de entorno para Docker
COPY frontend/.env.docker ./.env
# Compilar el frontend
RUN npm run build
# Verificar el resultado de la compilación
RUN ls -la dist/

# Etapa 4: Imagen final
FROM nginx:alpine
# Instalar Node.js
RUN apk add --update nodejs npm

# Copiar la aplicación frontend compilada
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Configurar nginx
RUN echo 'server {\
    listen 80;\
    server_name localhost;\
    \
    # Configuración para el frontend\
    location / {\
        root /usr/share/nginx/html;\
        index index.html index.htm;\
        try_files $uri $uri/ /index.html;\
    }\
    \
    # Configuración para redireccionar las peticiones API al backend\
    location /api/ {\
        proxy_pass http://localhost:3000;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection "upgrade";\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_cache_bypass $http_upgrade;\
    }\
}' > /etc/nginx/conf.d/default.conf

# Crear estructura de directorios para el backend
RUN mkdir -p /app/backend
RUN mkdir -p /app/shared

# Copiar el backend y sus dependencias
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=backend-builder /app/backend/package.json /app/backend/
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
# Copiar el módulo compartido (mantener la misma estructura que en desarrollo)
COPY --from=shared-builder /app/shared /app/shared

# Copiar archivo .env.docker para configuración en producción
COPY --from=backend-builder /app/backend/.env /app/backend/.env

# Crear script de inicio con información de diagnóstico
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "Iniciando servicios..."' >> /start.sh && \
    echo 'echo "Verificando estructura de directorios..."' >> /start.sh && \
    echo 'ls -la /app' >> /start.sh && \
    echo 'echo "Verificando archivos del backend..."' >> /start.sh && \
    echo 'ls -la /app/backend/dist' >> /start.sh && \
    echo 'echo "Verificando estructura del módulo compartido..."' >> /start.sh && \
    echo 'ls -la /app/shared/dist || echo "No se encuentra el módulo shared"' >> /start.sh && \
    echo 'echo "Verificando variables de entorno..."' >> /start.sh && \
    echo 'cat /app/backend/.env || echo "No hay archivo .env"' >> /start.sh && \
    echo 'echo "Iniciando backend..."' >> /start.sh && \
    echo 'cd /app/backend && node dist/server.js &' >> /start.sh && \
    echo 'echo "Iniciando nginx..."' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Verificar que el script existe y tiene permisos de ejecución
RUN ls -la /start.sh

# Exponer puertos
EXPOSE 80
EXPOSE 3000

# Comando para iniciar ambos servicios
CMD ["/bin/sh", "/start.sh"]
