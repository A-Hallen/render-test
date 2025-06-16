import React from 'react';
import { CreditCard } from 'lucide-react';
import { CarteraCreditoService } from '../../services/carteraCredito.service';
import { IndicadorFinancieroCard } from './IndicadorFinancieroCard';

interface CarteraCreditoCardProps {
  codigoOficina?: string;
}

export const CarteraCreditoCard: React.FC<CarteraCreditoCardProps> = ({ codigoOficina }) => {
  // Función para obtener los datos de cartera de crédito
  const fetchCarteraCredito = async (oficina?: string) => {
    const response = await CarteraCreditoService.obtenerCarteraCredito(oficina);
    // Transformar el resultado al formato esperado por IndicadorFinancieroData
    if (!response || !response.carteraActual) return null;

    // Devolvemos directamente el objeto carteraActual que ya tiene la estructura correcta
    return response.carteraActual;
  };

  return (
    <IndicadorFinancieroCard
      title="Cartera de Crédito"
      icon={<CreditCard size={20} />}
      color="blue"
      codigoOficina={codigoOficina}
      fetchData={fetchCarteraCredito}
    />
  );
};
