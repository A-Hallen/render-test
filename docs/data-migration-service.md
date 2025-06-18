# Servicio de Migración de Datos Contables: AWS a Firebase

## Descripción General

Este documento describe la arquitectura y el plan de implementación para un servicio de migración periódica de datos contables desde AWS a Firebase. El servicio verificará automáticamente la existencia de nuevos datos en AWS que no hayan sido migrados a Firebase, y procederá a migrarlos cuando sea necesario.

## Arquitectura del Sistema

### Componentes Principales

1. **Servicio de Migración Backend**
   - Servicio Node.js que se ejecuta periódicamente
   - Verifica y migra datos contables desde AWS a Firebase
   - Registra metadatos de migración en Firebase

2. **Configuración de Migración Frontend**
   - Interfaz de usuario para administradores en la sección de Ajustes
   - Permite configurar parámetros de migración y programar ejecuciones

3. **Sistema de Notificaciones**
   - Notifica a los administradores cuando inicia un proceso de migración
   - Proporciona información sobre el estado y resultados de la migración

### Flujo de Datos

```
+-------------+     +-------------------+     +------------------+
|  AWS RDS    | --> | Servicio Backend  | --> | Firebase        |
| (Datos      |     | (Migración        |     | (Datos migrados |
|  contables) |     |  periódica)       |     |  y metadatos)   |
+-------------+     +-------------------+     +------------------+
                            |
                            v
                    +-------------------+
                    | Sistema de        |
                    | Notificaciones    |
                    +-------------------+
                            |
                            v
                    +-------------------+
                    | Frontend          |
                    | (Configuración    |
                    |  de migración)    |
                    +-------------------+
```

## Implementación Técnica

### 1. Servicio de Migración Backend

#### Estructura de Archivos

```
backend/
  └── src/
      ├── services/
      │   └── migration/
      │       ├── migration.service.ts       # Servicio principal de migración
      │       ├── migration.scheduler.ts     # Programador de tareas de migración
      │       ├── migration.repository.ts    # Acceso a datos de migración en Firebase
      │       └── migration.types.ts         # Tipos y interfaces
      └── controllers/
          └── migration.controller.ts        # API endpoints para configuración
```

#### Funcionalidades Clave

1. **Verificación de Datos Pendientes**
   - Consulta la última fecha migrada en Firebase
   - Compara con los datos disponibles en AWS
   - Determina si hay datos nuevos para migrar

2. **Extracción de Datos**
   - Consulta datos contables desde AWS para fechas específicas
   - Utiliza la misma lógica de consulta que el script existente
   - Procesa los datos para adaptarlos al formato de Firebase

3. **Almacenamiento en Firebase**
   - Guarda los datos contables en la colección correspondiente
   - Actualiza el registro de la última fecha migrada
   - Mantiene metadatos sobre el proceso de migración

4. **Programación de Tareas**
   - Implementa un sistema de programación configurable
   - Permite definir la frecuencia de ejecución
   - Soporta ejecuciones manuales desde el frontend

5. **Notificaciones**
   - Envía notificaciones a administradores cuando inicia una migración
   - Proporciona resúmenes de resultados de migración
   - Alerta sobre errores o problemas durante la migración

### 2. Configuración Frontend

#### Estructura de Archivos

```
frontend/
  └── src/
      ├── pages/
      │   └── settings/
      │       └── DataMigrationSettings.tsx  # Página de configuración de migración
      ├── components/
      │   └── settings/
      │       └── migration/
      │           ├── MigrationScheduler.tsx # Componente para programar migraciones
      │           ├── MigrationHistory.tsx   # Historial de migraciones
      │           └── MigrationStatus.tsx    # Estado actual de migración
      └── services/
          └── migration.service.ts           # Cliente API para el servicio de migración
```

#### Funcionalidades de la UI

1. **Configuración de Programación**
   - Interfaz para configurar la frecuencia de migración
   - Opciones para migración diaria, semanal, etc.
   - Selección de hora preferida para la migración

2. **Ejecución Manual**
   - Botón para iniciar manualmente una migración
   - Confirmación antes de ejecutar
   - Indicador de progreso durante la ejecución

3. **Historial de Migraciones**
   - Tabla con historial de migraciones anteriores
   - Detalles sobre fechas, registros migrados, errores, etc.
   - Opciones para ver logs detallados

4. **Estado Actual**
   - Indicador del estado actual del servicio de migración
   - Última fecha migrada con éxito
   - Próxima migración programada

### 3. Modelo de Datos en Firebase

#### Colección de Metadatos de Migración

```typescript
interface MigrationMetadata {
  lastMigratedDate: string;        // Fecha del último dato migrado (YYYY-MM-DD)
  lastMigrationTimestamp: number;  // Timestamp de la última migración
  lastMigrationStatus: 'success' | 'failed' | 'in-progress';
  migrationSchedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
    dayOfWeek?: number;            // Para frecuencia semanal (0-6)
    dayOfMonth?: number;           // Para frecuencia mensual (1-31)
    hour: number;                  // Hora del día (0-23)
    minute: number;                // Minuto (0-59)
    enabled: boolean;              // Si la migración automática está habilitada
  };
  totalRecordsMigrated: number;    // Total acumulado de registros migrados
}
```

#### Colección de Historial de Migraciones

```typescript
interface MigrationHistoryEntry {
  id: string;                      // ID único de la migración
  startDate: string;               // Fecha de inicio de migración (YYYY-MM-DD)
  endDate: string;                 // Fecha final de migración (YYYY-MM-DD)
  startTimestamp: number;          // Timestamp de inicio
  endTimestamp: number;            // Timestamp de finalización
  status: 'success' | 'failed' | 'in-progress';
  recordsMigrated: number;         // Número de registros migrados
  error?: string;                  // Mensaje de error si falló
  triggeredBy: 'schedule' | 'manual'; // Cómo se inició la migración
  triggeredByUserId?: string;      // ID del usuario que inició manualmente
}
```

#### Colección de Datos Contables

```typescript
interface AccountingData {
  fecha: string;                   // Fecha del registro (YYYY-MM-DD)
  nombreOficina: string;           // Nombre de la oficina
  codigoOficina: string;           // Código de la oficina
  codigoCuentaContable: string;    // Código de cuenta contable
  nombreCuentaContable: string;    // Nombre de cuenta contable
  esDeudora: boolean;              // Si es cuenta deudora
  saldo: number;                   // Saldo contable
  migratedAt: number;              // Timestamp de cuando fue migrado
}
```

## Plan de Implementación

### Fase 1: Configuración Inicial

1. Crear estructura de colecciones en Firebase
2. Implementar repositorio de migración para acceder a Firebase
3. Crear servicio básico de migración con funcionalidad de extracción de datos

### Fase 2: Servicio de Migración

1. Implementar lógica completa de migración
2. Crear sistema de programación de tareas
3. Integrar sistema de notificaciones
4. Implementar manejo de errores y reintentos

### Fase 3: Frontend de Configuración

1. Crear componentes de UI para configuración de migración
2. Implementar cliente API para comunicación con el servicio
3. Integrar en la página de Ajustes existente
4. Implementar visualización de historial y estado

### Fase 4: Pruebas y Despliegue

1. Realizar pruebas exhaustivas con diferentes escenarios
2. Documentar el uso del sistema para administradores
3. Desplegar el servicio en entorno de producción
4. Configurar monitoreo y alertas

## Consideraciones Adicionales

### Seguridad

- El servicio de migración debe ejecutarse con privilegios mínimos necesarios
- Solo administradores deben tener acceso a la configuración de migración
- Las credenciales de acceso a AWS y Firebase deben almacenarse de forma segura

### Rendimiento

- Implementar migración por lotes para grandes volúmenes de datos
- Considerar límites de tasa de Firebase para escrituras masivas
- Optimizar consultas SQL para minimizar carga en AWS

### Recuperación ante Fallos

- Implementar mecanismo de checkpoint para continuar migraciones interrumpidas
- Registrar logs detallados para facilitar diagnóstico de problemas
- Crear sistema de alertas para fallos críticos

## Conclusión

Este servicio de migración proporcionará una solución robusta y configurable para mantener sincronizados los datos contables entre AWS y Firebase. La implementación por fases permitirá validar cada componente antes de avanzar, asegurando un sistema confiable y eficiente.
