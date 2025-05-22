import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as fs from 'fs-extra';
import * as path from 'path';

// Interfaces para los reportes
interface ReporteData {
  fechaInicio: string;
  fechaFin: string;
  oficina: string;
  nombreConfiguracion: string;
  tipoReporte: 'diario' | 'mensual';
  fechas: string[];
  categorias: {
    nombre: string;
    cuentas: {
      codigo: number;
      nombre: string;
      valoresPorFecha: { [fecha: string]: number };
      diferencias?: { [fecha: string]: { valor: number; porcentaje: number } };
    }[];
    totalesPorFecha: { [fecha: string]: number };
    diferencias?: { [fecha: string]: { valor: number; porcentaje: number } };
  }[];
  totalesGeneralesPorFecha: { [fecha: string]: number };
  diferenciasGenerales?: { [fecha: string]: { valor: number; porcentaje: number } };
  descripcionPeriodo?: string;
}

export class ExportService {
  private readonly EXPORT_DIR: string;

  constructor() {
    // Crear directorio para exportaciones si no existe
    this.EXPORT_DIR = path.join(__dirname, '../../../../exports');
    fs.ensureDirSync(this.EXPORT_DIR);
  }

  /**
   * Genera un archivo Excel a partir de los datos del reporte
   * @param reporteData Datos del reporte a exportar
   * @returns Ruta del archivo generado
   */
  async generarExcel(reporteData: ReporteData): Promise<string> {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistema de Reportes';
      workbook.lastModifiedBy = 'Sistema de Reportes';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Crear hoja de cálculo
      const worksheet = workbook.addWorksheet('Reporte Contabilidad');

      // Configurar estilos
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: '1E40AF' } }, // Azul corporativo
        border: {
          top: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          left: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          bottom: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          right: { style: 'thin' as const, color: { argb: 'C7D2FE' } }
        },
        alignment: { horizontal: 'center' as const, vertical: 'middle' as const }
      };

      const categoryStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: '3B82F6' } }, // Azul más claro
        border: {
          top: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          left: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          bottom: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          right: { style: 'thin' as const, color: { argb: 'C7D2FE' } }
        }
      };

      const totalStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: '3B82F6' } }, // Azul más claro para mejor contraste
        border: {
          top: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          left: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          bottom: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          right: { style: 'thin' as const, color: { argb: 'C7D2FE' } }
        }
      };

      const rowStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'EFF6FF' } }, // Azul muy claro
        border: {
          top: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          left: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          bottom: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          right: { style: 'thin' as const, color: { argb: 'C7D2FE' } }
        }
      };

      const alternateRowStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFFF' } },
        border: {
          top: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          left: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          bottom: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
          right: { style: 'thin' as const, color: { argb: 'C7D2FE' } }
        }
      };

      const positiveStyle = { font: { bold: true, color: { argb: '15803D' } } }; // Verde para valores positivos
      const negativeStyle = { font: { bold: true, color: { argb: 'DC2626' } } }; // Rojo para valores negativos

      const currencyFormat = '$#,##0.00;[Red]($#,##0.00)';

      // Calcular el número total de columnas para los merge cells
      const totalColumns = 2 + reporteData.fechas.length + (reporteData.fechas.length > 1 ? 1 : 0);
      const lastCol = String.fromCharCode(64 + totalColumns); // Convertir número a letra (A, B, C, etc.)
      
      // Añadir título del reporte con estilo mejorado
      worksheet.mergeCells(`A1:${lastCol}1`);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `REPORTE DE CONTABILIDAD - ${reporteData.nombreConfiguracion.toUpperCase()}`;
      titleCell.font = { bold: true, size: 18, color: { argb: '1E3A8A' } };
      titleCell.alignment = { horizontal: 'center' };
      titleCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'EFF6FF' } };
      titleCell.border = {
        top: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        left: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        bottom: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        right: { style: 'thin' as const, color: { argb: 'C7D2FE' } }
      };
      worksheet.getRow(1).height = 30;

      // Añadir información del reporte con estilo mejorado
      worksheet.mergeCells(`A2:${lastCol}2`);
      const periodoCell = worksheet.getCell('A2');
      periodoCell.value = reporteData.descripcionPeriodo || 
        `Periodo: ${reporteData.fechaInicio} al ${reporteData.fechaFin}`;
      periodoCell.font = { bold: true, size: 12, color: { argb: '1E3A8A' } };
      periodoCell.alignment = { horizontal: 'center' };
      periodoCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'EFF6FF' } };
      periodoCell.border = {
        top: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        left: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        bottom: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        right: { style: 'thin' as const, color: { argb: 'C7D2FE' } }
      };

      worksheet.mergeCells(`A3:${lastCol}3`);
      const oficinaCell = worksheet.getCell('A3');
      oficinaCell.value = `Oficina: ${reporteData.oficina}`;
      oficinaCell.font = { bold: true, size: 12, color: { argb: '1E3A8A' } };
      oficinaCell.alignment = { horizontal: 'center' };
      oficinaCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'EFF6FF' } };
      oficinaCell.border = {
        top: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        left: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        bottom: { style: 'thin' as const, color: { argb: 'C7D2FE' } },
        right: { style: 'thin' as const, color: { argb: 'C7D2FE' } }
      };
      
      // Espacio después del encabezado
      worksheet.getRow(4).height = 10;

      // Añadir encabezados
      let rowIndex = 5;
      const headerRow = worksheet.getRow(rowIndex);
      
      // Configurar columnas
      worksheet.getColumn(1).width = 10; // Código
      worksheet.getColumn(2).width = 30; // Cuenta/Categoría
      
      // Primera columna para códigos de cuenta
      headerRow.getCell(1).value = 'CUENTA / CATEGORÍA';
      headerRow.getCell(1).style = headerStyle;
      headerRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells(rowIndex, 1, rowIndex, 2); // Fusionar celdas de código y cuenta
      
      // Columnas para cada fecha
      let colIndex = 3;
      for (const fecha of reporteData.fechas) {
        worksheet.getColumn(colIndex).width = 15;
        headerRow.getCell(colIndex).value = fecha;
        headerRow.getCell(colIndex).style = headerStyle;
        colIndex++;
      }
      
      // Columna para variación total (si hay más de una fecha)
      if (reporteData.fechas.length > 1) {
        // Columna para variación de valor
        worksheet.getColumn(colIndex).width = 15;
        headerRow.getCell(colIndex).value = 'VAR. VALOR';
        headerRow.getCell(colIndex).style = headerStyle;
      }
      
      headerRow.height = 25;
      rowIndex++;

      // Añadir datos por categoría
      let isAlternateRow = false;
      for (const categoria of reporteData.categorias) {
        // Encabezado de categoría
        const categoriaRow = worksheet.getRow(rowIndex);
        categoriaRow.height = 25;
        
        // Fusionar celdas para el nombre de la categoría
        worksheet.mergeCells(rowIndex, 1, rowIndex, 2);
        categoriaRow.getCell(1).value = `▼ ${categoria.nombre}`;
        categoriaRow.getCell(1).style = categoryStyle;
        categoriaRow.getCell(1).font = { bold: true, color: { argb: '212529' } };
        
        // Añadir totales por fecha para la categoría
        colIndex = 3;
        let firstValue = 0;
        let lastValue = 0;
        
        for (let i = 0; i < reporteData.fechas.length; i++) {
          const fecha = reporteData.fechas[i];
          const value = categoria.totalesPorFecha[fecha];
          
          categoriaRow.getCell(colIndex).value = value;
          categoriaRow.getCell(colIndex).style = categoryStyle;
          categoriaRow.getCell(colIndex).numFmt = currencyFormat;
          categoriaRow.getCell(colIndex).alignment = { horizontal: 'right' };
          
          if (i === 0) firstValue = value;
          if (i === reporteData.fechas.length - 1) lastValue = value;
          
          colIndex++;
        }
        
        // Añadir variación total si hay más de una fecha
        if (reporteData.fechas.length > 1) {
          // Calcular la diferencia y el porcentaje
          const diferencia = lastValue - firstValue;
          let porcentaje = 0;
          
          if (firstValue !== 0) {
            porcentaje = (diferencia / Math.abs(firstValue)) * 100;
          } else if (diferencia !== 0) {
            porcentaje = diferencia > 0 ? 100 : -100;
          }
          
          // Usar valores directos en lugar de texto enriquecido para evitar problemas de caracteres
          const cell = categoriaRow.getCell(colIndex);
          
          // Formatear los valores como cadenas simples
          const signoValor = diferencia >= 0 ? '+' : '';
          const signoPorcentaje = porcentaje >= 0 ? '+' : '';
          
          // Usar un valor simple con formato personalizado para la columna de valor
          cell.value = diferencia;
          // Usar formato condicional para mostrar valores positivos en verde y negativos en rojo con iconos
          const iconoPositivo = '▲';
          const iconoNegativo = '▼';
          cell.numFmt = diferencia >= 0 ? 
            `[Green]"${iconoPositivo} ${signoValor}"$#,##0.00;[Red]"${iconoNegativo} -"$#,##0.00;"$"0.00` : 
            `[Green]"${iconoPositivo} ${signoValor}"$#,##0.00;[Red]"${iconoNegativo} -"$#,##0.00;"$"0.00`;
          cell.style = categoryStyle;
          cell.alignment = { horizontal: 'right' as const, vertical: 'middle' as const };
        }
        
        rowIndex++;
        
        // Añadir cuentas de la categoría
        for (const cuenta of categoria.cuentas) {
          const cuentaRow = worksheet.getRow(rowIndex);
          cuentaRow.height = 22;
          
          // Aplicar estilo alternado a las filas
          const rowStyle = isAlternateRow ? alternateRowStyle : {};
          
          // Código y nombre de la cuenta
          cuentaRow.getCell(1).value = cuenta.codigo;
          cuentaRow.getCell(1).style = isAlternateRow ? alternateRowStyle : rowStyle;
          cuentaRow.getCell(1).alignment = { horizontal: 'center' };
          
          cuentaRow.getCell(2).value = cuenta.nombre;
          cuentaRow.getCell(2).style = isAlternateRow ? alternateRowStyle : rowStyle;
          
          // Añadir valores por fecha
          colIndex = 3;
          let firstValue = 0;
          let lastValue = 0;
          
          for (let i = 0; i < reporteData.fechas.length; i++) {
            const fecha = reporteData.fechas[i];
            const value = cuenta.valoresPorFecha[fecha];
            
            cuentaRow.getCell(colIndex).value = value;
            cuentaRow.getCell(colIndex).style = isAlternateRow ? alternateRowStyle : rowStyle;
            cuentaRow.getCell(colIndex).numFmt = currencyFormat;
            cuentaRow.getCell(colIndex).alignment = { horizontal: 'right' };
            
            if (i === 0) firstValue = value;
            if (i === reporteData.fechas.length - 1) lastValue = value;
            
            colIndex++;
          }
          
          // Añadir variación total si hay más de una fecha
          if (reporteData.fechas.length > 1) {
            // Calcular la diferencia y el porcentaje
            const diferencia = lastValue - firstValue;
            let porcentaje = 0;
            
            if (firstValue !== 0) {
              porcentaje = (diferencia / Math.abs(firstValue)) * 100;
            } else if (diferencia !== 0) {
              porcentaje = diferencia > 0 ? 100 : -100;
            }
            
            // Usar valores directos en lugar de texto enriquecido para evitar problemas de caracteres
            const cell = cuentaRow.getCell(colIndex);
            
            // Formatear los valores como cadenas simples
            const signoValor = diferencia >= 0 ? '+' : '';
            
            // Usar un valor simple con formato personalizado para la columna de valor
            cell.value = diferencia;
            // Usar formato condicional para mostrar valores positivos en verde y negativos en rojo con iconos
            const iconoPositivo = '▲';
            const iconoNegativo = '▼';
            cell.numFmt = diferencia >= 0 ? 
              `[Green]"${iconoPositivo} ${signoValor}"$#,##0.00;[Red]"${iconoNegativo} -"$#,##0.00;"$"0.00` : 
              `[Green]"${iconoPositivo} ${signoValor}"$#,##0.00;[Red]"${iconoNegativo} -"$#,##0.00;"$"0.00`;
            cell.style = isAlternateRow ? alternateRowStyle : rowStyle;
            cell.alignment = { horizontal: 'right' as const, vertical: 'middle' as const };
          }
          
          rowIndex++;
          isAlternateRow = !isAlternateRow; // Alternar color de fila
        }
      }
      
      // Añadir espacio antes del total general
      rowIndex += 1;
      
      // Añadir totales generales
      const totalesRow = worksheet.getRow(rowIndex);
      totalesRow.height = 25;
      
      // Fusionar celdas para el total general
      worksheet.mergeCells(rowIndex, 1, rowIndex, 2);
      totalesRow.getCell(1).value = 'TOTAL GENERAL';
      totalesRow.getCell(1).style = totalStyle;
      totalesRow.getCell(1).font = { bold: true, color: { argb: '212529' } };
      
      // Añadir totales por fecha
      colIndex = 3;
      let firstTotal = 0;
      let lastTotal = 0;
      
      for (let i = 0; i < reporteData.fechas.length; i++) {
        const fecha = reporteData.fechas[i];
        const totalValue = reporteData.totalesGeneralesPorFecha[fecha];
        
        totalesRow.getCell(colIndex).value = totalValue;
        totalesRow.getCell(colIndex).style = totalStyle;
        totalesRow.getCell(colIndex).numFmt = currencyFormat;
        totalesRow.getCell(colIndex).alignment = { horizontal: 'right' };
        
        if (i === 0) firstTotal = totalValue;
        if (i === reporteData.fechas.length - 1) lastTotal = totalValue;
        
        colIndex++;
      }
      
      // Añadir variación total general si hay más de una fecha
      if (reporteData.fechas.length > 1) {
        // Calcular la diferencia y el porcentaje
        const diferencia = lastTotal - firstTotal;
        let porcentaje = 0;
        
        if (firstTotal !== 0) {
          porcentaje = (diferencia / Math.abs(firstTotal)) * 100;
        } else if (diferencia !== 0) {
          porcentaje = diferencia > 0 ? 100 : -100;
        }
        
        // Usar valores directos en lugar de texto enriquecido para evitar problemas de caracteres
        const cell = totalesRow.getCell(colIndex);
        
        // Formatear los valores como cadenas simples
        const signoValor = diferencia >= 0 ? '+' : '';
        
        // Usar un valor simple con formato personalizado para la columna de valor
        cell.value = diferencia;
        // Usar formato condicional para mostrar valores positivos en verde y negativos en rojo con iconos
        const iconoPositivo = '▲';
        const iconoNegativo = '▼';
        cell.numFmt = diferencia >= 0 ? 
          `[Green]"${iconoPositivo} ${signoValor}"$#,##0.00;[Red]"${iconoNegativo} -"$#,##0.00;"$"0.00` : 
          `[Green]"${iconoPositivo} ${signoValor}"$#,##0.00;[Red]"${iconoNegativo} -"$#,##0.00;"$"0.00`;
        cell.style = totalStyle;
        cell.alignment = { horizontal: 'right' as const, vertical: 'middle' as const };
      }
      
      // Ajustar anchos de columna
      worksheet.getColumn(1).width = 15; // Código
      worksheet.getColumn(2).width = 40; // Cuenta
      
      // Ajustar anchos para columnas de fechas y diferencias
      for (let i = 0; i < reporteData.fechas.length; i++) {
        const baseColIndex = 3 + (i * (reporteData.fechas.length > 1 ? 3 : 1));
        worksheet.getColumn(baseColIndex).width = 20; // Valor
        
        if (reporteData.fechas.length > 1 && i > 0) {
          worksheet.getColumn(baseColIndex + 1).width = 20; // Dif. Valor
          worksheet.getColumn(baseColIndex + 2).width = 15; // Dif. %
        }
      }

      // Generar nombre de archivo único
      const timestamp = new Date().getTime();
      const fileName = `reporte_${reporteData.nombreConfiguracion.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
      const filePath = path.join(this.EXPORT_DIR, fileName);
      
      // Guardar archivo
      await workbook.xlsx.writeFile(filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error al generar archivo Excel:', error);
      throw new Error(`Error al generar archivo Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera un archivo PDF a partir de los datos del reporte
   * @param reporteData Datos del reporte a exportar
   * @returns Ruta del archivo generado
   */
  async generarPDF(reporteData: ReporteData): Promise<string> {
    try {
      // Generar nombre de archivo único
      const timestamp = new Date().getTime();
      const fileName = `reporte_${reporteData.nombreConfiguracion.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      const filePath = path.join(this.EXPORT_DIR, fileName);
      
      // Crear documento PDF
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        layout: 'landscape'
      });
      
      // Crear stream para escribir el archivo
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Definir colores
      const colors = {
        header: '#F8F9FA',       // Color gris claro para el encabezado
        headerText: '#212529',   // Color texto encabezado
        categoryBg: '#F8F9FA',   // Color fondo categoría
        positiveDiff: '#15803D', // Color verde para diferencias positivas
        negativeDiff: '#DC2626', // Color rojo para diferencias negativas
        border: '#DEE2E6',       // Color bordes
        alternateRow: '#F8F9FA'  // Color filas alternas
      };
      
      // Añadir título
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#212529').text(
        `Reporte de Contabilidad - ${reporteData.nombreConfiguracion}`,
        { align: 'center' }
      );
      
      // Añadir información del reporte
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(
        reporteData.descripcionPeriodo || `Periodo: ${reporteData.fechaInicio} al ${reporteData.fechaFin}`,
        { align: 'center' }
      );
      
      doc.moveDown(0.5);
      doc.text(`Oficina: ${reporteData.oficina}`, { align: 'center' });
      
      doc.moveDown();
      
      // Calcular número de columnas y ancho disponible
      const numFechas = reporteData.fechas.length;
      const pageWidth = doc.page.width - 100; // Margen de 50 en cada lado
      
      // Determinar si incluir columnas de diferencia
      const incluirDiferencias = numFechas > 1;
      
      // Calcular anchos de columna
      const codigoWidth = 60;
      const cuentaWidth = 180;
      const varTotalWidth = 80;
      const fechaWidth = (pageWidth - codigoWidth - cuentaWidth - (incluirDiferencias ? varTotalWidth : 0)) / numFechas;
      
      // Posición Y inicial para la tabla
      let y = doc.y + 20;
      
      // Función para formatear números
      const formatNumber = (num: number) => {
        return new Intl.NumberFormat('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(num);
      };
      
      // Función para formatear porcentajes
      const formatPercent = (num: number) => {
        return new Intl.NumberFormat('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          style: 'percent'
        }).format(num / 100);
      };
      
      // Función para determinar el color basado en el valor
      const getDiffColor = (value: number) => {
        if (value > 0) return colors.positiveDiff;
        if (value < 0) return colors.negativeDiff;
        return '#212529'; // Color negro por defecto
      };
      
      // Función para dibujar una celda de tabla
      const drawCell = (text: string, x: number, width: number, height: number, options: {
        isHeader?: boolean,
        isCategory?: boolean,
        isTotal?: boolean,
        isAlternateRow?: boolean,
        isNumeric?: boolean,
        diffValue?: number,
        align?: string
      } = {}) => {
        const {
          isHeader = false,
          isCategory = false,
          isTotal = false,
          isAlternateRow = false,
          isNumeric = false,
          diffValue = 0,
          align = 'left'
        } = options;
        
        // Dibujar borde
        doc.lineWidth(0.5).strokeColor(colors.border).rect(x, y, width, height).stroke();
        
        // Rellenar fondo según el tipo de celda
        if (isHeader) {
          doc.fillColor(colors.header).rect(x, y, width, height).fill();
        } else if (isCategory) {
          doc.fillColor(colors.categoryBg).rect(x, y, width, height).fill();
        } else if (isAlternateRow) {
          doc.fillColor(colors.alternateRow).rect(x, y, width, height).fill();
        }
        
        // Determinar color del texto
        let textColor = '#212529';
        if (isHeader) {
          textColor = colors.headerText;
        } else if (diffValue !== 0) {
          textColor = getDiffColor(diffValue);
        }
        
        // Añadir texto
        doc.font((isHeader || isCategory || isTotal) ? 'Helvetica-Bold' : 'Helvetica')
           .fontSize(9)
           .fillColor(textColor)
           .text(text, x + 5, y + (height/2) - 4, {
             width: width - 10,
             align: isNumeric ? 'right' : (align as 'left' | 'center' | 'right' | 'justify' | undefined)
           });
        
        // Restaurar color de relleno
        doc.fillColor('#212529');
      };
      
      // Dibujar encabezados
      let x = 50;
      const rowHeight = 25;
      
      // Encabezados de código y cuenta
      drawCell('CUENTA / CATEGORÍA', x, codigoWidth + cuentaWidth, rowHeight, { isHeader: true, align: 'center' });
      x += codigoWidth + cuentaWidth;
      
      // Encabezados de fechas
      for (let i = 0; i < numFechas; i++) {
        drawCell(reporteData.fechas[i], x, fechaWidth, rowHeight, { isHeader: true, align: 'center' });
        x += fechaWidth;
      }
      
      // Encabezado de variación total si hay más de una fecha
      if (incluirDiferencias) {
        drawCell('VAR. TOTAL', x, varTotalWidth, rowHeight, { isHeader: true, align: 'center' });
      }
      
      y += rowHeight;
      
      // Dibujar datos por categoría
      let isAlternateRow = false;
      for (const categoria of reporteData.categorias) {
        // Verificar si necesitamos una nueva página
        if (y + rowHeight > doc.page.height - 50) {
          doc.addPage();
          y = 50;
        }
        
        // Encabezado de categoría
        x = 50;
        drawCell(`▼ ${categoria.nombre}`, x, codigoWidth + cuentaWidth, rowHeight, { isCategory: true });
        x += codigoWidth + cuentaWidth;
        
        // Totales por fecha para la categoría
        let lastFechaValue = 0;
        let totalDiff = 0;
        let totalPercent = 0;
        
        for (let i = 0; i < numFechas; i++) {
          const fecha = reporteData.fechas[i];
          const value = categoria.totalesPorFecha[fecha];
          drawCell(`$${formatNumber(value)}`, x, fechaWidth, rowHeight, { isCategory: true, isNumeric: true });
          x += fechaWidth;
          
          if (i === numFechas - 1 && i > 0) {
            lastFechaValue = value;
          }
          if (i === 0 && numFechas > 1) {
            totalDiff = categoria.totalesPorFecha[reporteData.fechas[numFechas - 1]] - value;
            if (value !== 0) {
              totalPercent = (totalDiff / value) * 100;
            }
          }
        }
        
        // Mostrar variación total si hay más de una fecha
        if (incluirDiferencias) {
          drawCell(`$${formatNumber(totalDiff)}\n${totalPercent.toFixed(2)}%`, x, varTotalWidth, rowHeight, {
            isCategory: true,
            isNumeric: true,
            diffValue: totalDiff
          });
        }
        
        y += rowHeight;
        
        // Cuentas de la categoría
        for (const cuenta of categoria.cuentas) {
          // Verificar si necesitamos una nueva página
          if (y + rowHeight > doc.page.height - 50) {
            doc.addPage();
            y = 50;
          }
          
          x = 50;
          drawCell(`${cuenta.codigo}`, x, codigoWidth, rowHeight, { isAlternateRow, isNumeric: true });
          x += codigoWidth;
          drawCell(cuenta.nombre, x, cuentaWidth, rowHeight, { isAlternateRow });
          x += cuentaWidth;
          
          // Valores por fecha
          let firstValue = 0;
          let lastValue = 0;
          
          for (let i = 0; i < numFechas; i++) {
            const fecha = reporteData.fechas[i];
            const value = cuenta.valoresPorFecha[fecha];
            drawCell(`$${formatNumber(value)}`, x, fechaWidth, rowHeight, { isAlternateRow, isNumeric: true });
            x += fechaWidth;
            
            if (i === 0) firstValue = value;
            if (i === numFechas - 1) lastValue = value;
          }
          
          // Mostrar variación total
          if (incluirDiferencias) {
            const diffValue = lastValue - firstValue;
            let percentChange = 0;
            if (firstValue !== 0) {
              percentChange = (diffValue / firstValue) * 100;
            }
            
            drawCell(`$${formatNumber(diffValue)}\n${percentChange.toFixed(2)}%`, x, varTotalWidth, rowHeight, {
              isAlternateRow,
              isNumeric: true,
              diffValue: diffValue
            });
          }
          
          y += rowHeight;
          isAlternateRow = !isAlternateRow; // Alternar color de fila
        }
        
        // Añadir espacio entre categorías
        y += 5;
      }
      
      // Añadir totales generales
      // Verificar si necesitamos una nueva página
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
      
      // Añadir espacio antes del total general
      y += 5;
      
      x = 50;
      drawCell('TOTAL GENERAL', x, codigoWidth + cuentaWidth, rowHeight, { isTotal: true });
      x += codigoWidth + cuentaWidth;
      
      // Totales por fecha
      let firstTotal = 0;
      let lastTotal = 0;
      
      for (let i = 0; i < numFechas; i++) {
        const fecha = reporteData.fechas[i];
        const totalValue = reporteData.totalesGeneralesPorFecha[fecha];
        drawCell(`$${formatNumber(totalValue)}`, x, fechaWidth, rowHeight, { isTotal: true, isNumeric: true });
        x += fechaWidth;
        
        if (i === 0) firstTotal = totalValue;
        if (i === numFechas - 1) lastTotal = totalValue;
      }
      
      // Mostrar variación total general
      if (incluirDiferencias) {
        const diffValue = lastTotal - firstTotal;
        let percentChange = 0;
        if (firstTotal !== 0) {
          percentChange = (diffValue / firstTotal) * 100;
        }
        
        drawCell(`$${formatNumber(diffValue)}\n${percentChange.toFixed(2)}%`, x, varTotalWidth, rowHeight, {
          isTotal: true,
          isNumeric: true,
          diffValue: diffValue
        });
      }
      
      // Añadir pie de página con fecha de generación
      doc.moveDown(2);
      doc.fontSize(8).text(
        `Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
        { align: 'right' }
      );
      
      // Finalizar documento
      doc.end();
      
      // Esperar a que se complete la escritura del archivo
      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error al generar archivo PDF:', error);
      throw new Error(`Error al generar archivo PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
