# FinCoop AI - Sistema de Gestión Financiera

Sistema de gestión financiera para cooperativas con funcionalidades de análisis contable, reportes personalizados e inteligencia artificial.

## Estructura del Proyecto

El proyecto está organizado como una aplicación monorepo con tres componentes principales:

- **Backend**: API REST en Express/Node.js con TypeScript
- **Frontend**: Aplicación React con TypeScript y Vite
- **Shared**: Biblioteca compartida de tipos y utilidades

## Tecnologías Principales

### Backend
- Node.js con Express
- TypeScript
- Sequelize ORM
- Firebase Authentication
- Google AI (Gemini)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Firebase (Autenticación)
- Bibliotecas de visualización (ECharts, ApexCharts, Recharts)

### Compartido
- TypeScript para definición de tipos
- Sistema de construcción compartido

## Características Principales

### Autenticación y Autorización
- Sistema completo de autenticación basado en Firebase y JWT
- Gestión de roles y permisos (admin, editor, user, gerente_oficina, gerente_general, analista)
- Protección de rutas según roles

### Reportes Financieros
- Configuración personalizada de reportes contables
- Análisis de tendencias financieras
- Exportación de datos contables

### Indicadores y KPIs
- Indicadores contables configurables
- KPIs para análisis financiero
- Visualización de datos con gráficos interactivos

### Asistente IA
- Integración con Google AI (Gemini)
- Chat asistente para consultas financieras
- Análisis de datos contables mediante IA

### Gestión de Oficinas
- Administración de sucursales/oficinas
- Asignación de gerentes a oficinas específicas

## Instalación y Configuración

### Requisitos Previos
- Node.js (versión recomendada: 18.x o superior)
- npm o yarn
- Cuenta en Firebase (para autenticación)
- Credenciales de Google AI (opcional, para funcionalidades de IA)

### Configuración Inicial

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/achiong-angia/ais-asistente.git
   cd ais-asistente
   ```

2. Instalar dependencias en cada directorio:
   ```bash
   # Instalar dependencias del backend
   cd backend
   npm install

   # Instalar dependencias del frontend
   cd ../frontend
   npm install

   # Instalar dependencias compartidas
   cd ../shared
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` en la carpeta backend
   - Configurar las credenciales de Firebase y otras variables necesarias

4. Compilar la biblioteca compartida:
   ```bash
   cd shared
   npm run build
   ```

### Ejecución en Desarrollo

1. Iniciar el backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Iniciar el frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Estructura de Módulos

### Backend

- **auth**: Autenticación y gestión de usuarios
- **configuracion-reportes**: Configuración de estructura de reportes
  - **contabilidad**: Reportes específicos de contabilidad
- **indicadores-contables**: Gestión de indicadores financieros
- **kpi-contables**: Cálculo y visualización de KPIs
- **oficinas**: Gestión de sucursales
- **ia**: Integración con servicios de IA
- **sincronizacion**: Sincronización de datos contables

### Frontend

- **components**: Componentes reutilizables de UI
- **context**: Contextos de React (Auth, Tema, etc.)
- **features**: Funcionalidades específicas organizadas por dominio
- **pages**: Páginas principales de la aplicación
- **services**: Servicios para comunicación con API
- **types**: Definiciones de tipos

## Contribución

1. Crear un fork del repositorio
2. Crear una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request
