-- Modificar la tabla REPORTES_CONTABILIDAD para reemplazar fecha por fechaInicio y fechaFin
-- y añadir la columna tipoReporte
ALTER TABLE `FBS_CONTABILIDADES.REPORTES_CONTABILIDAD`
-- Primero, añadir las nuevas columnas
ADD COLUMN fechaInicio DATE NOT NULL AFTER id,
ADD COLUMN fechaFin DATE NOT NULL AFTER fechaInicio,
ADD COLUMN tipoReporte ENUM('diario', 'mensual') NOT NULL DEFAULT 'mensual' AFTER nombreConfiguracion;

-- Copiar los datos de fecha a ambas columnas (para mantener compatibilidad con datos existentes)
UPDATE `FBS_CONTABILIDADES.REPORTES_CONTABILIDAD` 
SET fechaInicio = fecha, fechaFin = fecha;

-- Eliminar la columna fecha y sus índices
DROP INDEX idx_fecha ON `FBS_CONTABILIDADES.REPORTES_CONTABILIDAD`;
ALTER TABLE `FBS_CONTABILIDADES.REPORTES_CONTABILIDAD` DROP COLUMN fecha;

-- Crear nuevos índices para las nuevas columnas
ALTER TABLE `FBS_CONTABILIDADES.REPORTES_CONTABILIDAD`
ADD INDEX idx_fechaInicio (fechaInicio),
ADD INDEX idx_fechaFin (fechaFin);

-- Actualizar el comentario de la tabla para reflejar el cambio
ALTER TABLE `FBS_CONTABILIDADES.REPORTES_CONTABILIDAD` 
COMMENT 'Tabla para almacenar los reportes de contabilidad generados con rangos de fechas';

-- Nota: Este script debe ejecutarse después de actualizar el código de la aplicación
-- para evitar errores en la aplicación al acceder a la columna 'fecha' que ya no existirá.
