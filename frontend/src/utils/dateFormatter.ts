// Helper function to format dates (e.g., "2023-06-26" -> "26 Jun.")
export const formatDateToShortMonth = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};
