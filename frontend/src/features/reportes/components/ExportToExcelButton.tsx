import React from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { ReporteContabilidadData } from 'shared/src/types/reportes.types';
import { ExcelExportService } from '../services/excelExportService';

interface ExportToExcelButtonProps {
  reporteData: ReporteContabilidadData;
  fileName?: string;
  className?: string;
}

/**
 * Componente botón para exportar datos a Excel
 * Separa la responsabilidad de UI del servicio de exportación
 */
export const ExportToExcelButton: React.FC<ExportToExcelButtonProps> = ({
  reporteData,
  fileName,
  className = "px-3 py-1 bg-green-600 text-white rounded-md flex items-center text-sm hover:bg-green-700 transition"
}) => {
  const handleExportToExcel = async () => {
    try {
      toast.loading("Exportando reporte a Excel...", { id: "excel-export" });
      
      await ExcelExportService.exportReporteContabilidad(
        reporteData,
        fileName || `reporte-contabilidad-${reporteData.oficina}`
      );
      
      toast.success("Reporte exportado exitosamente", { id: "excel-export" });
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast.error("Error al exportar el reporte", { id: "excel-export" });
    }
  };

  return (
    <button 
      onClick={handleExportToExcel}
      className={className}
      title="Exportar a Excel"
    >
      <Download className="mr-1" size={16} />
      Exportar
    </button>
  );
};
