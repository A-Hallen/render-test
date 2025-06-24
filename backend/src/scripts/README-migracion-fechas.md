# Script de Migración de Fechas a Timestamp

Este script permite migrar los campos de fecha en formato string (`YYYY-MM-DD`) a campos de tipo timestamp de Firebase en la colección "SaldosContables".

## Problema que resuelve

La colección "SaldosContables" almacena las fechas como strings en formato `YYYY-MM-DD`, lo que dificulta realizar consultas eficientes por rango de fechas en Firebase. Este script añade un nuevo campo `fechaTimestamp` con el tipo de dato Timestamp nativo de Firebase, manteniendo el campo original `fecha` para garantizar compatibilidad con el código existente.

## Características

- Procesa documentos en lotes para evitar sobrecargar Firebase
- Guarda el progreso en un archivo temporal para poder reanudar la migración si se interrumpe
- Implementa retrasos entre operaciones para evitar límites de tasa de Firebase
- Muestra información detallada del progreso durante la ejecución
- Maneja errores y los registra para análisis posterior
- Utiliza operaciones batch para optimizar las actualizaciones
- Mantiene el campo original `fecha` para compatibilidad con el código existente

## Requisitos

- Node.js (v12 o superior)
- Acceso configurado a Firebase (variables de entorno o archivo de credenciales)

## Uso

1. Ejecutar el script desde la carpeta raíz del proyecto:

```bash
node ./src/scripts/ejecutarMigracionFechas.js
```

2. El script procesará todos los documentos en la colección "SaldosContables" con fechas entre `2024-09-01` y `2025-06-16`.

3. Si el script se interrumpe, puede ser reanudado ejecutando el mismo comando. El progreso se guarda en el archivo `migracion-fechas-progreso.json`.

## Archivos generados

- `migracion-fechas-progreso.json`: Contiene el progreso de la migración y permite reanudarla si se interrumpe.
- `migracion-fechas-errores.json`: Registra los errores encontrados durante la migración para análisis posterior.

## Después de la migración

Una vez completada la migración, puedes actualizar tus consultas para usar el nuevo campo `fechaTimestamp` en lugar de `fecha` cuando necesites realizar filtros por rango de fechas, lo que mejorará significativamente el rendimiento de las consultas.

Ejemplo de consulta optimizada:
```typescript
// Antes
const resultado = await firestore.collection('SaldosContables')
  .where('fecha', '>=', '2025-01-01')
  .where('fecha', '<=', '2025-01-31')
  .get();

// Después
const fechaInicio = admin.firestore.Timestamp.fromDate(new Date(2025, 0, 1));
const fechaFin = admin.firestore.Timestamp.fromDate(new Date(2025, 0, 31));
const resultado = await firestore.collection('SaldosContables')
  .where('fechaTimestamp', '>=', fechaInicio)
  .where('fechaTimestamp', '<=', fechaFin)
  .get();
```
