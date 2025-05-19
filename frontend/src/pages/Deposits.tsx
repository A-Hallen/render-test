import React, { useState } from 'react';
import { ChartCard } from '../components/dashboard/ChartCard';
import { KpiCard } from '../components/dashboard/KpiCard';
import { PiggyBank, TrendingUp, Building2, Wallet, Users } from 'lucide-react';

export const Deposits: React.FC = () => {
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [timeRange, setTimeRange] = useState('6m');

  // Datos de ejemplo
  const depositGrowthData = [
    { month: 'Ene', vista: 4500000, plazo: 6500000, total: 11000000 },
    { month: 'Feb', vista: 4600000, plazo: 6700000, total: 11300000 },
    { month: 'Mar', vista: 4700000, plazo: 6900000, total: 11600000 },
    { month: 'Abr', vista: 4800000, plazo: 7100000, total: 11900000 },
    { month: 'May', vista: 4900000, plazo: 7300000, total: 12200000 },
    { month: 'Jun', vista: 5000000, plazo: 7500000, total: 12500000 },
  ];

  const plazoFijoData = [
    { plazo: '30 días', monto: 2000000, tasa: 5.5, porcentaje: 25 },
    { plazo: '90 días', monto: 2500000, tasa: 6.0, porcentaje: 35 },
    { plazo: '180 días', monto: 1500000, tasa: 6.5, porcentaje: 20 },
    { plazo: '360 días', monto: 1500000, tasa: 7.0, porcentaje: 20 },
  ];

  const officePerformanceData = [
    { office: 'Matriz', vista: 2500000, plazo: 3500000, socios: 5000 },
    { office: 'Norte', vista: 1800000, plazo: 2500000, socios: 3500 },
    { office: 'Sur', vista: 1500000, plazo: 2000000, socios: 3000 },
    { office: 'Valle', vista: 1200000, plazo: 1500000, socios: 2500 },
  ];

  const concentrationData = [
    { month: 'Ene', individual: 75, corporativo: 25 },
    { month: 'Feb', individual: 76, corporativo: 24 },
    { month: 'Mar', individual: 74, corporativo: 26 },
    { month: 'Abr', individual: 73, corporativo: 27 },
    { month: 'May', individual: 72, corporativo: 28 },
    { month: 'Jun', individual: 71, corporativo: 29 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Captaciones</h1>
          <p className="text-gray-600">Análisis de depósitos y ahorros</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las oficinas</option>
            <option value="matriz">Matriz</option>
            <option value="norte">Agencia Norte</option>
            <option value="sur">Agencia Sur</option>
            <option value="valle">Agencia Valle</option>
          </select>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los productos</option>
            <option value="vista">Ahorros Vista</option>
            <option value="plazo">Plazo Fijo</option>
            <option value="programado">Ahorro Programado</option>
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">Último mes</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Captaciones"
          value="$12.5M"
          change={4.2}
          icon={<PiggyBank size={20} />}
          color="blue"
          description="Saldo total de depósitos"
        />
        
        <KpiCard
          title="Crecimiento Mensual"
          value="2.5%"
          change={0.3}
          icon={<TrendingUp size={20} />}
          color="green"
          description="Incremento neto de depósitos"
        />
        
        <KpiCard
          title="Tasa Promedio DPF"
          value="6.2%"
          change={0.2}
          icon={<Wallet size={20} />}
          color="purple"
          description="Depósitos a plazo fijo"
        />
        
        <KpiCard
          title="Socios con Ahorros"
          value="14,000"
          change={3.1}
          icon={<Users size={20} />}
          color="yellow"
          description="Cuentas activas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Evolución de Captaciones"
          subTitle="Crecimiento por tipo de depósito"
          type="line"
          data={depositGrowthData}
          xDataKey="month"
          series={[
            { dataKey: 'vista', color: '#2563EB', name: 'Ahorros Vista' },
            { dataKey: 'plazo', color: '#10B981', name: 'Plazo Fijo' },
            { dataKey: 'total', color: '#7C3AED', name: 'Total' },
          ]}
        />

        <ChartCard
          title="Distribución DPF"
          subTitle="Composición por plazo"
          type="bar"
          data={plazoFijoData}
          xDataKey="plazo"
          series={[
            { dataKey: 'monto', color: '#3B82F6', name: 'Monto' },
            { dataKey: 'tasa', color: '#F59E0B', name: 'Tasa %' },
            { dataKey: 'porcentaje', color: '#10B981', name: 'Porcentaje' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Desempeño por Oficina"
          subTitle="Captaciones por agencia"
          type="bar"
          data={officePerformanceData}
          xDataKey="office"
          series={[
            { dataKey: 'vista', color: '#3B82F6', name: 'Ahorros Vista' },
            { dataKey: 'plazo', color: '#10B981', name: 'Plazo Fijo' },
            { dataKey: 'socios', color: '#F59E0B', name: 'Socios' },
          ]}
        />

        <ChartCard
          title="Concentración de Depósitos"
          subTitle="Individual vs. Corporativo"
          type="area"
          data={concentrationData}
          xDataKey="month"
          series={[
            { dataKey: 'individual', color: '#3B82F6', name: 'Individual %' },
            { dataKey: 'corporativo', color: '#F59E0B', name: 'Corporativo %' },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Umbrales y Alertas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Crecimiento</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bajo</span>
              <span className="text-sm font-medium text-yellow-600">&lt; 1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Normal</span>
              <span className="text-sm font-medium text-green-600">1% - 3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alto</span>
              <span className="text-sm font-medium text-blue-600">&gt; 3%</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Concentración</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Individual</span>
              <span className="text-sm font-medium text-blue-600">&gt; 70%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Corporativo</span>
              <span className="text-sm font-medium text-blue-600">&lt; 30%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mayor Depositante</span>
              <span className="text-sm font-medium text-yellow-600">&lt; 3%</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Volatilidad</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Baja</span>
              <span className="text-sm font-medium text-green-600">&lt; 5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Media</span>
              <span className="text-sm font-medium text-yellow-600">5% - 10%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alta</span>
              <span className="text-sm font-medium text-red-600">&gt; 10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};