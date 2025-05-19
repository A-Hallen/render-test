import React from 'react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { CreditCard, Users, PiggyBank, DollarSign, BarChart3 } from 'lucide-react';
import { IndicadoresChart } from '../features/dashboard/IndicadoresChart';

export const Dashboard: React.FC = () => {
  // Sample data for charts
  const loanData = [
    { month: 'Ene', consumo: 250000, microCredito: 180000, vivienda: 120000 },
    { month: 'Feb', consumo: 280000, microCredito: 190000, vivienda: 125000 },
    { month: 'Mar', consumo: 300000, microCredito: 210000, vivienda: 130000 },
    { month: 'Abr', consumo: 320000, microCredito: 220000, vivienda: 140000 },
    { month: 'May', consumo: 340000, microCredito: 230000, vivienda: 145000 },
    { month: 'Jun', consumo: 360000, microCredito: 240000, vivienda: 150000 },
  ];

  const depositsData = [
    { month: 'Ene', ahorrosVista: 400000, plazoFijo: 600000 },
    { month: 'Feb', ahorrosVista: 420000, plazoFijo: 650000 },
    { month: 'Mar', ahorrosVista: 450000, plazoFijo: 680000 },
    { month: 'Abr', ahorrosVista: 470000, plazoFijo: 700000 },
    { month: 'May', ahorrosVista: 490000, plazoFijo: 720000 },
    { month: 'Jun', ahorrosVista: 510000, plazoFijo: 750000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600">Resumen de indicadores financieros al 30 de junio, 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Cartera de Crédito"
          value="$4,850,000"
          change={8.5}
          icon={<CreditCard size={20} />}
          color="blue"
          description="Total de la cartera de crédito activa"
        />

        <KpiCard
          title="Socios Activos"
          value="12,450"
          change={5.2}
          icon={<Users size={20} />}
          color="green"
          description="Número de socios con cuentas activas"
        />

        <KpiCard
          title="Captaciones"
          value="$7,250,000"
          change={12}
          icon={<PiggyBank size={20} />}
          color="purple"
          description="Total de depósitos (vista y plazo fijo)"
        />

        <KpiCard
          title="Índice de Morosidad"
          value="3.2%"
          change={-0.7}
          icon={<BarChart3 size={20} />}
          color="red"
          description="Porcentaje de cartera vencida frente al total"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Evolución de Cartera de Crédito"
          subTitle="Distribución por tipo de crédito (últimos 6 meses)"
          type="area"
          data={loanData}
          xDataKey="month"
          series={[
            { dataKey: 'consumo', color: '#2563EB', name: 'Consumo' },
            { dataKey: 'microCredito', color: '#7C3AED', name: 'Microcrédito' },
            { dataKey: 'vivienda', color: '#10B981', name: 'Vivienda' },
          ]}
          height={300}
        />

        <ChartCard
          title="Evolución de Captaciones"
          subTitle="Distribución por tipo de depósito (últimos 6 meses)"
          type="bar"
          data={depositsData}
          xDataKey="month"
          series={[
            { dataKey: 'ahorrosVista', color: '#F59E0B', name: 'Ahorros a la Vista' },
            { dataKey: 'plazoFijo', color: '#EF4444', name: 'Depósitos a Plazo' },
          ]}
          height={300}
        />
      </div>
      <IndicadoresChart />
    </div>
  );
};