import * as XLSX from 'xlsx';
import { ReporteContabilidadData } from 'shared/src/types/reportes.types';

/**
 * Servicio para exportar datos a Excel
 * Implementa la lógica de exportación separada de los componentes de UI
 */
export class ExcelExportService {
  /**
   * Exporta los datos de un reporte de contabilidad a Excel
   * @param reporteData Datos del reporte a exportar
   * @param fileName Nombre del archivo Excel a generar (sin extensión)
   * @returns Promise que se resuelve cuando la exportación ha finalizado
   */
  public static exportReporteContabilidad(
    reporteData: ReporteContabilidadData,
    fileName = 'reporte-contabilidad'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Crear una hoja de trabajo
        const worksheet = XLSX.utils.aoa_to_sheet([]);
        
        // Añadir título y metadatos
        this.addHeaderInfo(worksheet, reporteData);
        
        // Añadir datos de categorías y cuentas
        this.addReporteData(worksheet, reporteData);
        
        // Crear libro de trabajo y añadir la hoja
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Contabilidad');
        
        // Aplicar estilos (XLSX no soporta estilos avanzados, pero podemos ajustar anchos)
        this.applyStyles(worksheet);
        
        // Generar el archivo y descargarlo
        XLSX.writeFile(workbook, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
        
        resolve();
      } catch (error) {
        console.error('Error al exportar a Excel:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Añade la información de cabecera al worksheet
   */
  private static addHeaderInfo(worksheet: XLSX.WorkSheet, reporteData: ReporteContabilidadData): void {
    // Añadir título
    XLSX.utils.sheet_add_aoa(worksheet, [
      [`Reporte de Contabilidad - ${reporteData.oficina}`],
      [`Configuración: ${reporteData.nombreConfiguracion}`],
      [`Período: ${new Date(reporteData.fechaInicio).toLocaleDateString('es-ES')} a ${new Date(reporteData.fechaFin).toLocaleDateString('es-ES')}`],
      [''] // Línea en blanco
    ], { origin: 'A1' });
  }
  
  /**
   * Añade los datos del reporte al worksheet
   */
  private static addReporteData(worksheet: XLSX.WorkSheet, reporteData: ReporteContabilidadData): void {
    // Crear encabezados de tabla
    const headers = ['Cuenta / Categoría'];
    
    // Añadir fechas como encabezados
    reporteData.fechas.forEach(fecha => {
      headers.push(new Date(fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }));
    });
    
    // Añadir columna de variación total si hay más de una fecha
    if (reporteData.fechas.length > 1) {
      headers.push('Var. Total');
    }
    
    // Añadir encabezados a la hoja
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A5' });
    
    let rowIndex = 6; // Comenzar después de los encabezados
    
    // Añadir datos de cada categoría
    reporteData.categorias.forEach(categoria => {
      // Fila de categoría
      const categoriaRow = [categoria.nombre];
      
      // Añadir valores para cada fecha
      reporteData.fechas.forEach(fecha => {
        categoriaRow.push(this.formatCurrency(categoria.valores[fecha] || 0));
      });
      
      // Añadir variación total si hay más de una fecha
      if (reporteData.fechas.length > 1) {
        const firstValue = categoria.valores[reporteData.fechas[0]] || 0;
        const lastValue = categoria.valores[reporteData.fechas[reporteData.fechas.length - 1]] || 0;
        const difference = lastValue - firstValue;
        const percentageChange = firstValue !== 0 
          ? (difference / Math.abs(firstValue) * 100) 
          : 0;
        
        categoriaRow.push(`${this.formatCurrency(difference)} (${this.formatPercentage(percentageChange)})`);
      }
      
      // Añadir fila de categoría a la hoja
      XLSX.utils.sheet_add_aoa(worksheet, [categoriaRow], { origin: `A${rowIndex}` });
      rowIndex++;
      
      // Añadir filas para cada cuenta de la categoría
      categoria.cuentas.forEach(cuenta => {
        const cuentaRow = [`${cuenta.codigo} - ${cuenta.nombre}`];
        
        // Añadir valores para cada fecha
        reporteData.fechas.forEach(fecha => {
          cuentaRow.push(this.formatCurrency(cuenta.valores[fecha] || 0));
        });
        
        // Añadir variación total si hay más de una fecha
        if (reporteData.fechas.length > 1) {
          const firstValue = cuenta.valores[reporteData.fechas[0]] || 0;
          const lastValue = cuenta.valores[reporteData.fechas[reporteData.fechas.length - 1]] || 0;
          const difference = lastValue - firstValue;
          const percentageChange = firstValue !== 0 
            ? (difference / Math.abs(firstValue) * 100) 
            : 0;
          
          cuentaRow.push(`${this.formatCurrency(difference)} (${this.formatPercentage(percentageChange)})`);
        }
        
        // Añadir fila de cuenta a la hoja
        XLSX.utils.sheet_add_aoa(worksheet, [cuentaRow], { origin: `A${rowIndex}` });
        rowIndex++;
      });
    });
  }
  
  /**
   * Aplica estilos básicos a la hoja de trabajo
   */
  private static applyStyles(worksheet: XLSX.WorkSheet): void {
    // Ajustar anchos de columnas
    const columnWidths = [
      { wch: 40 }, // Columna A (Cuenta/Categoría)
    ];
    
    // Añadir anchos para las demás columnas
    for (let i = 1; i < 10; i++) {
      columnWidths.push({ wch: 20 }); // Columnas de fechas y variación
    }
    
    worksheet['!cols'] = columnWidths;
  }
  
  /**
   * Formatea un valor numérico como moneda
   */
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }
  
  /**
   * Formatea un valor numérico como porcentaje
   */
  private static formatPercentage(value: number): string {
    const sign = value > 0 ? '▲' : value < 0 ? '▼' : '';
    return `${sign}${Math.abs(value).toFixed(2)}%`;
  }
}
