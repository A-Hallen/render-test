import React, { useState } from 'react';
import { ChartCard } from '../components/dashboard/ChartCard';
import { KpiCard } from '../components/dashboard/KpiCard';
import { CreditCard, TrendingUp, AlertTriangle, Target, Building2 } from 'lucide-react';

export const Loans: React.FC = () => {
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [timeRange, setTimeRange] = useState('6m');

  // Datos de ejemplo para las gráficas
  const loanPerformanceData = [
    { month: 'Ene', desembolsos: 800000, recuperacion: 600000, morosidad: 3.2 },
    { month: 'Feb', desembolsos: 850000, recuperacion: 620000, morosidad: 3.1 },
    { month: 'Mar', desembolsos: 900000, recuperacion: 650000, morosidad: 3.0 },
    { month: 'Abr', desembolsos: 920000, recuperacion: 680000, morosidad: 2.9 },
    { month: 'May', desembolsos: 950000, recuperacion: 700000, morosidad: 2.8 },
    { month: 'Jun', desembolsos: 980000, recuperacion: 730000, morosidad: 2.7 },
  ];

  const productDistributionData = [
    { product: 'Consumo', valor: 3500000, porcentaje: 45 },
    { product: 'Microempresa', valor: 2500000, porcentaje: 32 },
    { product: 'Vivienda', valor: 1200000, porcentaje: 15 },
    { product: 'Comercial', valor: 600000, porcentaje: 8 },
  ];

  const officePerformanceData = [
    { office: 'Matriz', desembolsos: 2500000, morosidad: 2.5, solicitudes: 120 },
    { office: 'Norte', desembolsos: 1800000, morosidad: 3.1, solicitudes: 85 },
    { office: 'Sur', desembolsos: 1500000, morosidad: 2.8, solicitudes: 75 },
    { office: 'Valle', desembolsos: 1200000, morosidad: 3.2, solicitudes: 60 },
  ];

  const riskIndicatorsData = [
    { month: 'Ene', riesgoNormal: 92, riesgoPotencial: 5, deficiente: 2, dudoso: 1 },
    { month: 'Feb', riesgoNormal: 93, riesgoPotencial: 4, deficiente: 2, dudoso: 1 },
    { month: 'Mar', riesgoNormal: 93, riesgoPotencial: 4, deficiente: 2, dudoso: 1 },
    { month: 'Abr', riesgoNormal: 94, riesgoPotencial: 3, deficiente: 2, dudoso: 1 },
    { month: 'May', riesgoNormal: 94, riesgoPotencial: 3, deficiente: 2, dudoso: 1 },
    { month: 'Jun', riesgoNormal: 95, riesgoPotencial: 3, deficiente: 1, dudoso: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Cartera</h1>
          <p className="text-gray-600">Análisis detallado de cartera de crédito</p>
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
            <option value="consumo">Crédito Consumo</option>
            <option value="microempresa">Microcrédito</option>
            <option value="vivienda">Crédito Vivienda</option>
            <option value="comercial">Crédito Comercial</option>
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
          title="Cartera Total"
          value="$7.8M"
          change={8.5}
          icon={<CreditCard size={20} />}
          color="blue"
          description="Saldo total de cartera"
        />
        
        <KpiCard
          title="Crecimiento Mensual"
          value="3.2%"
          change={0.5}
          icon={<TrendingUp size={20} />}
          color="green"
          description="Incremento neto de cartera"
        />
        
        <KpiCard
          title="Índice de Morosidad"
          value="2.7%"
          change={-0.5}
          icon={<AlertTriangle size={20} />}
          color="red"
          description="Cartera en riesgo"
        />
        
        <KpiCard
          title="Cumplimiento"
          value="98.5%"
          change={1.2}
          icon={<Target size={20} />}
          color="purple"
          description="Meta mensual de colocación"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Desempeño de Cartera"
          subTitle="Desembolsos vs. Recuperación"
          type="line"
          data={loanPerformanceData}
          xDataKey="month"
          series={[
            { dataKey: 'desembolsos', color: '#2563EB', name: 'Desembolsos' },
            { dataKey: 'recuperacion', color: '#10B981', name: 'Recuperación' },
            { dataKey: 'morosidad', color: '#EF4444', name: 'Morosidad %' },
          ]}
        />

        <ChartCard
          title="Distribución por Producto"
          subTitle="Composición de cartera por tipo de crédito"
          type="bar"
          data={productDistributionData}
          xDataKey="product"
          series={[
            { dataKey: 'valor', color: '#3B82F6', name: 'Valor' },
            { dataKey: 'porcentaje', color: '#10B981', name: 'Porcentaje' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Desempeño por Oficina"
          subTitle="Indicadores clave por agencia"
          type="bar"
          data={officePerformanceData}
          xDataKey="office"
          series={[
            { dataKey: 'desembolsos', color: '#3B82F6', name: 'Desembolsos' },
            { dataKey: 'morosidad', color: '#EF4444', name: 'Morosidad' },
            { dataKey: 'solicitudes', color: '#10B981', name: 'Solicitudes' },
          ]}
        />

        <ChartCard
          title="Indicadores de Riesgo"
          subTitle="Clasificación de cartera por nivel de riesgo"
          type="area"
          data={riskIndicatorsData}
          xDataKey="month"
          series={[
            { dataKey: 'riesgoNormal', color: '#10B981', name: 'Riesgo Normal' },
            { dataKey: 'riesgoPotencial', color: '#F59E0B', name: 'Riesgo Potencial' },
            { dataKey: 'deficiente', color: '#EF4444', name: 'Deficiente' },
            { dataKey: 'dudoso', color: '#7C3AED', name: 'Dudoso Recaudo' },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Umbrales y Alertas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Morosidad</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Normal</span>
              <span className="text-sm font-medium text-green-600">&lt; 3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Precaución</span>
              <span className="text-sm font-medium text-yellow-600">3% - 5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Crítico</span>
              <span className="text-sm font-medium text-red-600">&gt; 5%</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Crecimiento</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bajo</span>
              <span className="text-sm font-medium text-yellow-600">&lt; 1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Esperado</span>
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
              <span className="text-sm text-gray-600">Consumo</span>
              <span className="text-sm font-medium text-blue-600">&lt; 50%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Microcrédito</span>
              <span className="text-sm font-medium text-blue-600">&lt; 35%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Otros</span>
              <span className="text-sm font-medium text-blue-600">&lt; 25%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};