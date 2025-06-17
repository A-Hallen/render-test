# Módulo de Cooperativa

## Descripción
Este módulo gestiona la información de la cooperativa en el sistema. En la práctica, solo existirá una única cooperativa en la base de datos, y sus datos solo podrán ser modificados por usuarios con rol de administrador.

## Estructura del módulo
- `cooperativa.repository.ts`: Implementa la capa de acceso a datos utilizando Firebase Firestore.
- `cooperativa.service.ts`: Contiene la lógica de negocio del módulo.
- `cooperativa.controller.ts`: Maneja las peticiones HTTP y respuestas.
- `cooperativa.routes.ts`: Define las rutas del API para este módulo.

## Modelo de datos
El módulo utiliza la interfaz `CooperativaDTO` definida en el proyecto compartido (`shared`):

```typescript
export interface CooperativaDTO {
  id: string;
  nombre: string;
  ruc: string;
  direccion: string;
  email: string;
  zonaHoraria: string;
  formatoFecha: string;
  idioma: string;
  logo?: string;
  createdAt: number;
  updatedAt: number;
}
```

## Endpoints API

### Públicos (no requieren autenticación)
- `GET /api/cooperativa/public`: Obtiene la información básica de la cooperativa.

### Privados (requieren autenticación)
- `GET /api/cooperativa`: Obtiene toda la información de la cooperativa.
- `PUT /api/cooperativa`: Actualiza la información de la cooperativa (solo para administradores).

## Integración con el Frontend
El módulo se integra con el frontend de las siguientes maneras:
1. En la cabecera (`Header.tsx`): Muestra el nombre de la cooperativa.
2. En la página de configuración (`Settings.tsx`): Permite a los administradores ver y modificar los datos de la cooperativa.

## Seguridad
- La información básica de la cooperativa (nombre) es pública y accesible sin autenticación.
- La información completa requiere autenticación.
- Solo los usuarios con rol de administrador pueden modificar la información de la cooperativa.

## Casos de uso
1. Mostrar el nombre de la cooperativa en la cabecera de la aplicación.
2. Permitir a los administradores configurar los datos de la cooperativa.
3. Mantener la información de la cooperativa centralizada y consistente en toda la aplicación.
