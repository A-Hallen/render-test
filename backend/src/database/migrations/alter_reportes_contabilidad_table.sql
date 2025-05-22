-- Migration script to modify the ReporteContabilidad table
-- Makes totalGeneral column nullable

-- Direct approach to alter the table
ALTER TABLE `reportes_contabilidad` MODIFY COLUMN `totalGeneral` DECIMAL(18, 2) NULL;

-- If you're using a different table name, replace 'reportes_contabilidad' with your actual table name
-- You can find this in your database.constants.ts file
