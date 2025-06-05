import React from "react";
import { KpiCard } from "../components/dashboard/KpiCard";
import { BarChart3 } from "lucide-react";
import { CaptacionesCard } from "../components/dashboard/CaptacionesCard";
import { ApexIndicadoresChart } from "../features/dashboard/ApexIndicadoresChart";
import { CarteraCreditoCard } from "../components/dashboard/CarteraCreditoCard";

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
      </div>

      <div className="flex flex-wrap gap-4">
        <CarteraCreditoCard codigoOficina="CNS" />
        <CaptacionesCard tipo="vista" />
        <CaptacionesCard tipo="plazo" />

        <KpiCard
          title="Índice de Morosidad"
          value="3.2%"
          change={-0.7}
          icon={<BarChart3 size={20} />}
          color="red"
          description="Porcentaje de cartera vencida frente al total"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Indicadores Contables
          </h2>
        </div>
        <ApexIndicadoresChart />
      </div>
    </div>
  );
};
