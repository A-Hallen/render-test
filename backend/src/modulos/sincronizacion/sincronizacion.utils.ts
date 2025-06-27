export class SyncUtils {
    static formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  
    static generarRangoFechas(fechaInicio: string, fechaFin: string): string[] {
      const fechas: string[] = [];
      const currentDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);
  
      if (isNaN(currentDate.getTime())) throw new Error("Fecha de inicio inválida");
      if (isNaN(endDate.getTime())) throw new Error("Fecha de fin inválida");
  
      while (currentDate <= endDate) {
        fechas.push(this.formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      return fechas;
    }
    static formatDateToHumanReadable(
        date: Date,
        options: {
          includeWeekday?: boolean;
          includeTime?: boolean;
          timeFormat?: '12h' | '24h';
          locale?: string;
        } = {}
      ): string {
        // Configuración por defecto
        const {
          includeWeekday = true,
          includeTime = false,
          timeFormat = '24h',
          locale = 'es-ES', // Por defecto español, puedes cambiarlo
        } = options;
      
        // Opciones para Intl.DateTimeFormat
        const formatOptions: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
      
        if (includeWeekday) {
          formatOptions.weekday = 'long';
        }
      
        if (includeTime) {
          formatOptions.hour = 'numeric';
          formatOptions.minute = 'numeric';
          if (timeFormat === '12h') {
            formatOptions.hour12 = true;
          } else {
            formatOptions.hour12 = false;
          }
        }
      
        // Formatear la fecha
        let formattedDate = new Intl.DateTimeFormat(locale, formatOptions).format(date);
      
        // Opcional: capitalizar la primera letra (dependiendo del locale)
        if (includeWeekday) {
          formattedDate = formattedDate.replace(/^\w/, (c) => c.toUpperCase());
        }
      
        return formattedDate;
      }
    
}