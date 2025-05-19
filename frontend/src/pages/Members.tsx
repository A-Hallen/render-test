import React, { useState } from 'react';
import { ChartCard } from '../components/dashboard/ChartCard';
import { KpiCard } from '../components/dashboard/KpiCard';
import { Users, UserPlus, UserMinus, Building2, Wallet } from 'lucide-react';

export const Members: React.FC = () => {
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [timeRange, setTimeRange] = useState('6m');

  // Datos de ejemplo
  const memberGrowthData = [
    { month: 'Ene', activos: 12000, nuevos: 250, inactivos: 150, reactivados: 50 },
    { month: 'Feb', activos: 12100, nuevos: 240, inactivos: 140, reactivados: 45 },
    { month: 'Mar', activos: 12200, nuevos: 260, inactivos: 160, reactivados: 55 },
    { month: 'Abr', activos: 12300, nuevos: 270, inactivos: 170, reactivados: 60 },
    { month: 'May', activos: 12400, nuevos: 280, inactivos: 180, reactivados: 65 },
    { month: 'Jun', activos: 12500, nuevos: 290, inactivos: 190, reactivados: 70 },
  ];

  const segmentDistributionData = [
    { segment: 'Premium', cantidad: 2500, porcentaje: 20 },
    { segment: 'Preferencial', cantidad: 3750, porcentaje: 30 },
    { segment: 'Clásico', cantidad: 5000, porcentaje: 40 },
    { segment: 'Básico', cantidad: 1250, porcentaje: 10 },
  ];

  const productUsageData = [
    { month: 'Ene', ahorro: 8000, credito: 4000, inversiones: 2000 },
    { month: 'Feb', ahorro: 8200, credito: 4100, inversiones: 2100 },
    { month: 'Mar', ahorro: 8400, credito: 4200, inversiones: 2200 },
    { month: 'Abr', ahorro: 8600, credito: 4300, inversiones: 2300 },
    { month: 'May', ahorro: 8800, credito: 4400, inversiones: 2400 },
    { month: 'Jun', ahorro: 9000, credito: 4500, inversiones: 2500 },
  ];

  const retentionData = [
    { month: 'Ene', retencion: 95, satisfaccion: 88, nps: 45 },
    { month: 'Feb', retencion: 94, satisfaccion: 87, nps: 44 },
    { month: 'Mar', retencion: 96, satisfaccion: 89, nps: 46 },
    { month: 'Abr', retencion: 95, satisfaccion: 88, nps: 45 },
    { month: 'May', retencion: 97, satisfaccion: 90, nps: 47 },
    { month: 'Jun', retencion: 96, satisfaccion: 89, nps: 46 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Socios</h1>
          <p className="text-gray-600">Análisis y seguimiento de socios</p>
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
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los segmentos</option>
            <option value="premium">Premium</option>
            <option value="preferencial">Preferencial</option>
            <option value="clasico">Clásico</option>
            <option value="basico">Básico</option>
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
          title="Total Socios"
          value="12,500"
          change={2.5}
          icon={<Users size={20} />}
          color="blue"
          description="Socios activos"
        />
        
        <KpiCard
          title="Nuevos Socios"
          value="290"
          change={3.6}
          icon={<UserPlus size={20} />}
          color="green"
          description="Último mes"
        />
        
        <KpiCard
          title="Tasa de Retención"
          value="96%"
          change={1.0}
          icon={<UserMinus size={20} />}
          color="purple"
          description="Socios activos retenidos"
        />
        
        <KpiCard
          title="Productos por Socio"
          value="2.8"
          change={0.2}
          icon={<Wallet size={20} />}
          color="yellow"
          description="Promedio de productos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Evolución de Socios"
          subTitle="Crecimiento y movimiento de socios"
          type="line"
          data={memberGrowthData}
          xDataKey="month"
          series={[
            { dataKey: 'activos', color: '#2563EB', name: 'Activos' },
            { dataKey: 'nuevos', color: '#10B981', name: 'Nuevos' },
            { dataKey: 'inactivos', color: '#EF4444', name: 'Inactivos' },
            { dataKey: 'reactivados', color: '#F59E0B', name: 'Reactivados' },
          ]}
        />

        <ChartCard
          title="Distribución por Segmento"
          subTitle="Composición de socios por segmento"
          type="bar"
          data={segmentDistributionData}
          xDataKey="segment"
          series={[
            { dataKey: 'cantidad', color: '#3B82F6', name: 'Cantidad' },
            { dataKey: 'porcentaje', color: '#10B981', name: 'Porcentaje' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Uso de Productos"
          subTitle="Socios por tipo de producto"
          type="area"
          data={productUsageData}
          xDataKey="month"
          series={[
            { dataKey: 'ahorro', color: '#3B82F6', name: 'Ahorro' },
            { dataKey: 'credito', color: '#10B981', name: 'Crédito' },
            { dataKey: 'inversiones', color: '#F59E0B', name: 'Inversiones' },
          ]}
        />

        <ChartCard
          title="Indicadores de Satisfacción"
          subTitle="Retención, satisfacción y NPS"
          type="line"
          data={retentionData}
          xDataKey="month"
          series={[
            { dataKey: 'retencion', color: '#3B82F6', name: 'Retención %' },
            { dataKey: 'satisfaccion', color: '#10B981', name: 'Satisfacción %' },
            { dataKey: 'nps', color: '#F59E0B', name: 'NPS' },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Umbrales y Métricas Clave</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Retención</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Óptimo</span>
              <span className="text-sm font-medium text-green-600">&gt; 95%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aceptable</span>
              <span className="text-sm font-medium text-yellow-600">90% - 95%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Crítico</span>
              <span className="text-sm font-medium text-red-600">&lt; 90%</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Satisfacción</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Excelente</span>
              <span className="text-sm font-medium text-green-600">&gt; 90%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bueno</span>
              <span className="text-sm font-medium text-yellow-600">80% - 90%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mejorable</span>
              <span className="text-sm font-medium text-red-600">&lt; 80%</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">NPS</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Excelente</span>
              <span className="text-sm font-medium text-green-600">&gt; 50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bueno</span>
              <span className="text-sm font-medium text-yellow-600">30 - 50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mejorable</span>
              <span className="text-sm font-medium text-red-600">&lt; 30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};