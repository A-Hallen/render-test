import { ConfiguracionReporteContabilidad as ConfiguracionReporte } from '../../configuracion-reportes/contabilidad/configuracion-reportes-contabilidad.model';
import { ReporteContabilidad } from './reporte-contabilidad.model';
import { SaldosRepository } from '../../saldosContables/saldos.repository';
import { sequelize } from '../../../database/database.connection';
import { QueryTypes } from 'sequelize';
import {
  TABLA_CUENTACONTABLE,
  TABLA_DIVISION,
  TABLA_SALDOCONTABLE
} from '../../../database/database.constants';
import {
  ConfiguracionReporteDTO,
  CuentaData
} from 'shared/src/types/reportes.types';
import { IndicadorContable } from '../../indicadores-contables/interfaces/IndicadorContable.interface';

// Interfaces para las solicitudes y respuestas
interface ReporteContabilidadRequest {
  fechaInicio?: string;
  fechaFin?: string;
  fecha?: string;
  oficina: string;
  nombreConfiguracion: string;
  tipoReporte?: 'diario' | 'mensual';
}

interface ResultadoReporteContabilidad {
  id?: number;
  fechaInicio: string;
  fechaFin: string;
  oficina: string;
  nombreConfiguracion: string;
  tipoReporte: 'diario' | 'mensual';
  fechas: string[]; // Array de fechas para las columnas
  categorias: {
    nombre: string;
    cuentas: {
      codigo: number;
      nombre: string;
      valoresPorFecha: { [fecha: string]: number }; // Valores por cada fecha
      diferencias?: { [fecha: string]: { valor: number; porcentaje: number } }; // Diferencias entre períodos
    }[];
    totalesPorFecha: { [fecha: string]: number }; // Totales por fecha para la categoría
    diferencias?: { [fecha: string]: { valor: number; porcentaje: number } }; // Diferencias entre períodos para la categoría
  }[];
  totalesGeneralesPorFecha: { [fecha: string]: number }; // Totales generales por fecha
  diferenciasGenerales?: { [fecha: string]: { valor: number; porcentaje: number } }; // Diferencias generales entre períodos
  descripcionPeriodo?: string;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
}

export class ReporteContabilidadRepository {
  model;
  private sequelize;
  private saldosRepository;

  constructor() {
    this.model = ReporteContabilidad;
    this.saldosRepository = new SaldosRepository();
    this.sequelize = sequelize;
    // Usamos directamente el modelo ConfiguracionReporte para las consultas
  }

  /**
   * Genera un reporte de contabilidad basado en los parámetros proporcionados
   * @param reporteData Datos para generar el reporte
   * @returns Resultado del reporte de contabilidad
   */
  generarReporteContabilidad = async (reporteData: ReporteContabilidadRequest) => {
    try {
      // Validar la configuración del reporte
      const configuracion = await ConfiguracionReporte.findOne({
        where: { nombre: reporteData.nombreConfiguracion, esActivo: true }
      });


      if (!configuracion) {
        return {
          success: false,
          message: 'Configuración de reporte no encontrada o inactiva'
        };
      }

      // Determinar si es un reporte por fecha o por rango
      let saldos: any[] = [];
      let fechaReporte: string;
      let descripcionPeriodo: string = '';

      const cuentas = configuracion.categorias.flatMap((categoria) => categoria.cuentas);

      if (reporteData.fechaInicio && reporteData.fechaFin) {
        // Reporte por rango de fechas
        const fechaInicio = new Date(Date.parse(reporteData.fechaInicio + 'T00:00:00'));
        const fechaFin = new Date(Date.parse(reporteData.fechaFin + 'T00:00:00'));
        
        // Determinar si es reporte diario o mensual
        const tipoReporte = reporteData.tipoReporte || 'mensual';
        console.log(`[repository] Generando reporte ${tipoReporte} de ${reporteData.fechaInicio} a ${reporteData.fechaFin}`);
        
        // Generar array de fechas en el rango según el tipo de reporte
        const fechas: Date[] = [];
        
        if (tipoReporte === 'diario') {
          // Para reportes diarios, incluir cada día en el rango
          const fechaActual = new Date(fechaInicio);
          while (fechaActual <= fechaFin) {
            fechas.push(new Date(fechaActual));
            fechaActual.setDate(fechaActual.getDate() + 1);
          }
          descripcionPeriodo = `Reporte diario del ${reporteData.fechaInicio} al ${reporteData.fechaFin}`;
        } else {
          // Para reportes mensuales, incluir solo el último día de cada mes
          let currentMonth = fechaInicio.getMonth();
          let currentYear = fechaInicio.getFullYear();
          
          // Iterar por cada mes en el rango
          while (new Date(currentYear, currentMonth + 1, 0) <= fechaFin) {
            // El día 0 del mes siguiente es el último día del mes actual
            const ultimoDiaMes = new Date(currentYear, currentMonth + 1, 0);
            fechas.push(new Date(ultimoDiaMes));
            
            // Avanzar al siguiente mes
            currentMonth++;
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
          }
          descripcionPeriodo = `Reporte mensual del ${fechaInicio.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} al ${fechaFin.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        }

        
        // Obtener saldos para todas las fechas en el rango
        if (fechas.length > 0) {
          saldos = await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(
            reporteData.oficina,
            fechas,
            cuentas
          );
        }
        
        // Usar las fechas de inicio y fin para el reporte
        fechaReporte = reporteData.fechaFin;
      } else if (reporteData.fecha) {
        // Reporte por fecha específica (mantener compatibilidad)
        const fecha = new Date(Date.parse(reporteData.fecha + 'T00:00:00'));
        saldos = await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(
          reporteData.oficina,
          [fecha],
          cuentas
        );
        fechaReporte = reporteData.fecha;
        descripcionPeriodo = `Reporte del ${reporteData.fecha}`;
      } else {
        return {
          success: false,
          message: 'Debe proporcionar una fecha o un rango de fechas'
        };
      }

      if (!saldos || saldos.length === 0) {
        return {
          success: false,
          message: 'No se encontraron saldos para la oficina y fecha especificadas'
        };
      }

      // Extraer fechas únicas de los saldos para usar como columnas
      const fechasUnicas = [...new Set(saldos.map((s: any) => s.fecha))].sort();
      
      // Procesar las categorías definidas en la configuración
      const categoriasProcesadas = [];
      const totalesGeneralesPorFecha: { [fecha: string]: number } = {};
      const diferenciasGenerales: { [fecha: string]: { valor: number; porcentaje: number } } = {};
      
      // Inicializar totales generales por fecha
      fechasUnicas.forEach(fecha => {
        totalesGeneralesPorFecha[fecha] = 0;
      });

      for (const categoria in configuracion.categorias) {
        const category = configuracion.categorias[categoria];
        const cuentasData = await this.obtenerNombresCuenta(category.cuentas);
        
        // Calcular los totales por cuenta y por fecha
        const cuentasDetalle = [];
        const totalesPorFecha: { [fecha: string]: number } = {};
        const diferenciasPorFecha: { [fecha: string]: { valor: number; porcentaje: number } } = {};
        
        // Inicializar totales por fecha para esta categoría
        fechasUnicas.forEach(fecha => {
          totalesPorFecha[fecha] = 0;
        });

        for (const cuenta of cuentasData as CuentaData[]) {
          // Inicializar valores por fecha para esta cuenta
          const valoresPorFecha: { [fecha: string]: number } = {};
          const diferenciasCuenta: { [fecha: string]: { valor: number; porcentaje: number } } = {};
          
          // Inicializar con ceros para todas las fechas
          fechasUnicas.forEach(fecha => {
            valoresPorFecha[fecha] = 0;
          });
          
          // Agrupar saldos por fecha para esta cuenta
          for (const saldo of saldos) {
            if (saldo.codigoCuentaContable === cuenta.CODIGO) {
              // Sumar al valor existente para esa fecha (por si hay múltiples registros)
              valoresPorFecha[saldo.fecha] = (valoresPorFecha[saldo.fecha] || 0) + saldo.saldo;
              // Sumar al total de la categoría para esa fecha
              totalesPorFecha[saldo.fecha] = (totalesPorFecha[saldo.fecha] || 0) + saldo.saldo;
            }
          }
          
          // Calcular diferencias entre períodos para esta cuenta
          for (let i = 1; i < fechasUnicas.length; i++) {
            const fechaActual = fechasUnicas[i];
            const fechaAnterior = fechasUnicas[i-1];
            const valorActual = valoresPorFecha[fechaActual];
            const valorAnterior = valoresPorFecha[fechaAnterior];
            
            const diferencia = valorActual - valorAnterior;
            let porcentaje = 0;
            
            if (valorAnterior !== 0) {
              porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
            } else if (diferencia !== 0) {
              // Si el valor anterior es 0 pero hay diferencia, es un incremento del 100%
              porcentaje = diferencia > 0 ? 100 : -100;
            }
            
            diferenciasCuenta[fechaActual] = {
              valor: diferencia,
              porcentaje: parseFloat(porcentaje.toFixed(2))
            };
          }
          
          console.log(`[repository] Cuenta ${cuenta.CODIGO} - Valores por fecha:`, valoresPorFecha);
          
          cuentasDetalle.push({
            codigo: cuenta.CODIGO,
            nombre: cuenta.NOMBRE,
            valoresPorFecha,
            diferencias: diferenciasCuenta
          });
        }
        
        // Calcular diferencias entre períodos para la categoría
        for (let i = 1; i < fechasUnicas.length; i++) {
          const fechaActual = fechasUnicas[i];
          const fechaAnterior = fechasUnicas[i-1];
          const valorActual = totalesPorFecha[fechaActual];
          const valorAnterior = totalesPorFecha[fechaAnterior];
          
          const diferencia = valorActual - valorAnterior;
          let porcentaje = 0;
          
          if (valorAnterior !== 0) {
            porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
          } else if (diferencia !== 0) {
            porcentaje = diferencia > 0 ? 100 : -100;
          }
          
          diferenciasPorFecha[fechaActual] = {
            valor: diferencia,
            porcentaje: parseFloat(porcentaje.toFixed(2))
          };
        }
        
        // Sumar al total general por fecha
        Object.entries(totalesPorFecha).forEach(([fecha, total]) => {
          totalesGeneralesPorFecha[fecha] += total;
        });
        
        categoriasProcesadas.push({
          nombre: category.nombre,
          cuentas: cuentasDetalle,
          totalesPorFecha,
          diferencias: diferenciasPorFecha
        });
      }
      
      // Calcular diferencias generales entre períodos
      for (let i = 1; i < fechasUnicas.length; i++) {
        const fechaActual = fechasUnicas[i];
        const fechaAnterior = fechasUnicas[i-1];
        const valorActual = totalesGeneralesPorFecha[fechaActual];
        const valorAnterior = totalesGeneralesPorFecha[fechaAnterior];
        
        const diferencia = valorActual - valorAnterior;
        let porcentaje = 0;
        
        if (valorAnterior !== 0) {
          porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
        } else if (diferencia !== 0) {
          porcentaje = diferencia > 0 ? 100 : -100;
        }
        
        diferenciasGenerales[fechaActual] = {
          valor: diferencia,
          porcentaje: parseFloat(porcentaje.toFixed(2))
        };
      }

      // Ya hemos calculado los totales generales por fecha

      // Crear el resultado del reporte
      const resultado: ResultadoReporteContabilidad = {
        fechaInicio: (reporteData.fechaInicio || reporteData.fecha) as string,
        fechaFin: (reporteData.fechaFin || reporteData.fecha) as string,
        oficina: reporteData.oficina,
        nombreConfiguracion: reporteData.nombreConfiguracion,
        tipoReporte: reporteData.tipoReporte || 'mensual',
        fechas: fechasUnicas,
        categorias: categoriasProcesadas,
        totalesGeneralesPorFecha,
        diferenciasGenerales,
        descripcionPeriodo
      };

      // Guardar el reporte en la base de datos
      const reporteGuardado = await ReporteContabilidad.create(resultado as any);

      return {
        success: true,
        message: 'Reporte generado correctamente',
        data: reporteGuardado
      };
    } catch (error: any) {
      console.error('Error al generar reporte de contabilidad:', error);
      return {
        success: false,
        message: `Error al generar reporte: ${error.message || 'Error desconocido'}`
      };
    }
  };

  /**
   * Obtiene los nombres de las cuentas contables a partir de sus códigos
   * @param cuentas Códigos de las cuentas contables
   * @returns Información de las cuentas contables
   */
  obtenerNombresCuenta = async (cuentas: string[]) => {
    if (!cuentas || cuentas.length === 0) {
      return [];
    }

    const query = `
      SELECT D.CODIGO, D.NOMBRE
      FROM \`${TABLA_DIVISION}\` D 
      INNER JOIN \`${TABLA_CUENTACONTABLE}\` CC ON CC.SECUENCIALDIVISION = D.SECUENCIAL
      WHERE D.CODIGO IN (:cuentas)
      AND CC.ESTAACTIVA = TRUE
    `;
    
    const cuentaData = await this.sequelize.query(query, {
      replacements: { cuentas },
      type: QueryTypes.SELECT
    });
    
    return cuentaData;
  };

  /**
   * Calcula una parte específica de la fórmula para el reporte de contabilidad
   * @param cuentas Códigos de las cuentas a incluir en el cálculo
   * @param fecha Fecha para la cual calcular los saldos
   * @param oficina Código de la oficina
   * @returns Resultado del cálculo
   */
  _calcularParteDeLaFormula = async (cuentas: string[], fecha: Date, oficina: string) => {
    if (!cuentas || cuentas.length === 0) {
      return 0;
    }

    const fechaStr = fecha.toISOString().split('T')[0];
    
    const query = `
      SELECT SUM(SC.SALDO) as TOTAL
      FROM \`${TABLA_SALDOCONTABLE}\` SC
      INNER JOIN \`${TABLA_CUENTACONTABLE}\` CC ON SC.SECUENCIALCUENTACONTABLE = CC.SECUENCIAL
      INNER JOIN \`${TABLA_DIVISION}\` D ON CC.SECUENCIALDIVISION = D.SECUENCIAL
      WHERE D.CODIGO IN (:cuentas)
      AND SC.FECHA = :fecha
      AND SC.CODIGOOFICINA = :oficina
    `;
    
    const resultado = await this.sequelize.query(query, {
      replacements: { cuentas, fecha: fechaStr, oficina },
      type: QueryTypes.SELECT
    });
    
    const result = resultado[0] as { TOTAL?: number } || {};
    return result.TOTAL || 0;
  };

  /**
   * Obtiene los datos históricos de contabilidad para un rango de fechas
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @param oficina Código de la oficina
   * @param nombreConfiguracion Nombre de la configuración del reporte
   * @returns Datos históricos de contabilidad
   */
  obtenerDatosHistoricos = async (
    fechaInicio: string,
    fechaFin: string,
    oficina: string,
    nombreConfiguracion: string,
    tipoReporte: 'diario' | 'mensual' = 'mensual'
  ) => {
    try {
      // Verificar si la configuración existe
      const configuracion = await ConfiguracionReporte.findOne({
        where: { nombre: nombreConfiguracion, esActivo: true }
      });
      
      if (!configuracion) {
        return {
          success: false,
          message: 'Configuración de reporte no encontrada o inactiva'
        };
      }

      // Buscar reportes existentes por oficina
      const reportesExistentes = await ReporteContabilidad.findAll({
        where: {
          oficina,
          nombreConfiguracion,
          esActivo: true
        },
        order: [['fechaFin', 'ASC']]
      });

      // Filtrar reportes que estén dentro del rango de fechas solicitado
      const reportesFiltrados = reportesExistentes.filter(reporte => {
        // Verificar si el rango de fechas del reporte se superpone con el rango solicitado
        return (
          (reporte.fechaInicio <= fechaFin && reporte.fechaFin >= fechaInicio) ||
          (reporte.fechaInicio >= fechaInicio && reporte.fechaInicio <= fechaFin) ||
          (reporte.fechaFin >= fechaInicio && reporte.fechaFin <= fechaFin)
        );
      });
      
      console.log("[repository] Reportes filtrados:", reportesFiltrados.length);

      // Si hay reportes existentes filtrados, devolverlos
      if (reportesFiltrados && reportesFiltrados.length > 0) {
        return {
          success: true,
          message: 'Datos históricos obtenidos correctamente',
          data: reportesFiltrados
        };
      }

      // Si no hay reportes existentes, generar un único reporte para todo el rango
      const reporteData: ReporteContabilidadRequest = {
        fechaInicio,
        fechaFin,
        oficina,
        nombreConfiguracion,
        tipoReporte
      };
      
      const resultado = await this.generarReporteContabilidad(reporteData);
      
      if (resultado.success && resultado.data) {
        return {
          success: true,
          message: 'Datos históricos generados correctamente',
          data: [resultado.data]
        };
      }

      return {
        success: false,
        message: 'No se pudieron generar los datos históricos',
        data: []
      };
    } catch (error: any) {
      console.error('Error al obtener datos históricos:', error);
      return {
        success: false,
        message: `Error al obtener datos históricos: ${error.message || 'Error desconocido'}`
      };
    }
  };
  
  /**
   * Obtiene un reporte de contabilidad por su ID
   * @param id ID del reporte
   * @returns Reporte de contabilidad o null si no existe
   */
  obtenerReportePorId = async (id: number) => {
    try {
      const reporte = await ReporteContabilidad.findOne({
        where: { id, esActivo: true }
      });
      
      return reporte;
    } catch (error) {
      console.error('Error al obtener reporte por ID:', error);
      throw error;
    }
  };
  
  /**
   * Obtiene todos los reportes de contabilidad para una oficina
   * @param oficina Código de la oficina
   * @returns Lista de reportes de contabilidad
   */
  obtenerReportesPorOficina = async (oficina: string) => {
    try {
      const reportes = await ReporteContabilidad.findAll({
        where: { oficina, esActivo: true },
        order: [['fechaFin', 'DESC']]
      });
      
      return reportes;
    } catch (error) {
      console.error('Error al obtener reportes por oficina:', error);
      throw error;
    }
  };
  
  /**
   * Actualiza un reporte de contabilidad existente
   * @param id ID del reporte a actualizar
   * @param datos Datos actualizados del reporte
   * @returns Resultado de la actualización
   */
  actualizarReporte = async (id: number, datos: any) => {
    try {
      const reporte = await ReporteContabilidad.findOne({
        where: { id, esActivo: true }
      });
      
      if (!reporte) {
        return {
          success: false,
          message: 'Reporte no encontrado'
        };
      }
      
      // Actualizar solo los campos permitidos
      await reporte.update({
        ...datos,
        fechaModificacion: new Date()
      });
      
      return {
        success: true,
        message: 'Reporte actualizado correctamente',
        data: reporte
      };
    } catch (error: any) {
      console.error('Error al actualizar reporte:', error);
      return {
        success: false,
        message: `Error al actualizar reporte: ${error.message || 'Error desconocido'}`
      };
    }
  };
  
  /**
   * Elimina lógicamente un reporte de contabilidad
   * @param id ID del reporte a eliminar
   * @returns Resultado de la eliminación
   */
  eliminarReporte = async (id: number) => {
    try {
      const reporte = await ReporteContabilidad.findOne({
        where: { id, esActivo: true }
      });
      
      if (!reporte) {
        return {
          success: false,
          message: 'Reporte no encontrado'
        };
      }
      
      // Eliminación lógica
      await reporte.update({
        esActivo: false,
        fechaModificacion: new Date()
      });
      
      return {
        success: true,
        message: 'Reporte eliminado correctamente'
      };
    } catch (error: any) {
      console.error('Error al eliminar reporte:', error);
      return {
        success: false,
        message: `Error al eliminar reporte: ${error.message || 'Error desconocido'}`
      };
    }
  };

  /**
   * Genera un array de fechas en formato YYYY-MM-DD dentro del rango especificado
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @returns Array de fechas en formato YYYY-MM-DD
   */
  _generarFechasEnRango = (fechaInicio: string, fechaFin: string): string[] => {
    const fechas: string[] = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (inicio > fin) {
      return [];
    }
    
    // Generar array de fechas (mensual)
    const fechaActual = new Date(inicio);
    
    while (fechaActual <= fin) {
      fechas.push(fechaActual.toISOString().split('T')[0]);
      // Avanzar al siguiente mes
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
    
    // Asegurar que la fecha final esté incluida
    const ultimaFecha = fechas[fechas.length - 1];
    if (ultimaFecha !== fechaFin) {
      fechas.push(fechaFin);
    }
    
    return fechas;
  };
}