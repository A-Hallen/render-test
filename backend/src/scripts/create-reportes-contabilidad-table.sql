-- Script para crear la tabla REPORTES_CONTABILIDAD en el esquema FBS_CONTABILIDADES
-- Fecha: 2025-05-16

-- Verificar si la tabla ya existe y eliminarla si es necesario
-- DROP TABLE IF EXISTS FBS_CONTABILIDADES.REPORTES_CONTABILIDAD;

-- Crear la tabla REPORTES_CONTABILIDAD
CREATE TABLE IF NOT EXISTS `FBS_CONTABILIDADES.REPORTES_CONTABILIDAD` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    oficina VARCHAR(20) NOT NULL,
    nombreConfiguracion VARCHAR(100) NOT NULL,
    categorias JSON NOT NULL,
    totalGeneral DECIMAL(18, 2) NOT NULL,
    esActivo BOOLEAN NOT NULL DEFAULT TRUE,
    fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaModificacion DATETIME NOT NULL DEFAcleULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para mejorar el rendimiento de las consultas
    INDEX idx_fecha (fecha),
    INDEX idx_oficina (oficina),
    INDEX idx_nombreConfiguracion (nombreConfiguracion),
    INDEX idx_esActivo (esActivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de la tabla y columnas para documentación
ALTER TABLE FBS_CONTABILIDADES.REPORTES_CONTABILIDAD 
COMMENT 'Tabla para almacenar los reportes de contabilidad generados';

-- Permisos (ajustar según sea necesario)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON FBS_CONTABILIDADES.REPORTES_CONTABILIDAD TO 'usuario_app';
