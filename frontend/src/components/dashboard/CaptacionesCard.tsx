import React from 'react';
import { Wallet, Clock } from 'lucide-react';
import { getCaptacionesVista, getCaptacionesPlazo } from '../../services/captaciones.service';
import { IndicadorFinancieroCard } from './IndicadorFinancieroCard';

interface CaptacionesCardProps {
  tipo: 'vista' | 'plazo';
  codigoOficina?: string;
  color?: string; // Color personalizado para la barra indicadora
}

const TIPO_LABEL: Record<'vista' | 'plazo', string> = {
  vista: 'Captaciones a la Vista',
  plazo: 'Captaciones a Plazo',
};

const ICONO_COMPONENTE: Record<'vista' | 'plazo', React.ReactNode> = {
  vista: <Wallet size={20} />,
  plazo: <Clock size={20} />,
};

const COLOR: Record<'vista' | 'plazo', 'blue' | 'green' | 'red' | 'yellow' | 'purple'> = {
  vista: 'green',
  plazo: 'purple',
};

const INDICATOR_COLOR: Record<'vista' | 'plazo', string> = {
  vista: 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-600',
  plazo: 'bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-600',
};

export const CaptacionesCard: React.FC<CaptacionesCardProps> = ({ tipo, codigoOficina = 'CNS', color }) => {
  // Función para obtener los datos de captaciones según el tipo
  const fetchCaptaciones = async (oficina?: string) => {
    try {
      const response = tipo === 'vista'
        ? await getCaptacionesVista(oficina || 'CNS')
        : await getCaptacionesPlazo(oficina || 'CNS');
      
      // Si no hay datos, retornar null
      if (!response || !response.captacionActual) return null;
      
      // Devolvemos directamente el objeto captacionActual que ya tiene la estructura correcta
      return response.captacionActual;
    } catch (error) {
      console.error(`Error al obtener captaciones a ${tipo}:`, error);
      return null;
    }
  };

  return (
    <IndicadorFinancieroCard
      title={TIPO_LABEL[tipo]}
      icon={ICONO_COMPONENTE[tipo]}
      color={COLOR[tipo]}
      indicatorColor={color || INDICATOR_COLOR[tipo]}
      codigoOficina={codigoOficina}
      fetchData={fetchCaptaciones}
    />
  );
};
