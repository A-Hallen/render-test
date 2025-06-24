import React from 'react';
import { Card } from '../../../components/ui';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { IndicadorFinanciero, ComparacionData } from './types';

interface GraficosComparacionProps {
  indicadoresOficina1: IndicadorFinanciero[];
  indicadoresOficina2: IndicadorFinanciero[];
  comparacionData: ComparacionData | null;
  fechaMostrada: string;
}

/**
 * Componente para mostrar gráficos comparativos de indicadores financieros
 * Incluye un gráfico de barras y un gráfico de radar
 */
export const GraficosComparacion: React.FC<GraficosComparacionProps> = ({
  indicadoresOficina1,
  indicadoresOficina2,
  comparacionData,
  fechaMostrada
}) => {
  return (
    <div className="space-y-6">
      {/* Gráfico de barras comparativo */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Gráfico Comparativo de Indicadores
        </h3>
        <div className="h-96">
          <ReactApexChart
            options={{
              chart: {
                type: "bar",
                height: 350,
                toolbar: {
                  show: true,
                },
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: "55%",
                  borderRadius: 4,
                  dataLabels: {
                    position: "top",
                  },
                },
              },
              dataLabels: {
                enabled: true,
                formatter: function (val) {
                  const numberValue = Number(val);
                  return numberValue.toFixed(2) + "%";
                },
                offsetY: -20,
                style: {
                  fontSize: "12px",
                  colors: ["#304758"],
                },
              },
              stroke: {
                show: true,
                width: 2,
                colors: ["transparent"],
              },
              xaxis: {
                categories: indicadoresOficina1.map(
                  (ind) => ind.nombre
                ),
                title: {
                  text: "Indicadores Financieros",
                },
              },
              yaxis: {
                title: {
                  text: "Porcentaje (%)",
                },
                min: 0,
                max: 100,
              },
              fill: {
                opacity: 1,
              },
              tooltip: {
                y: {
                  formatter: function (val) {
                    return val.toFixed(2) + "%";
                  },
                },
              },
              colors: ["#4F46E5", "#10B981"],
              legend: {
                position: "top",
                horizontalAlign: "center",
                offsetY: 0,
              },
              title: {
                text: `Comparación al ${fechaMostrada}`,
                align: "center",
                style: {
                  fontSize: "16px",
                },
              },
            } as ApexOptions}
            series={[
              {
                name: comparacionData?.nombreOficina1 || "Oficina 1",
                data: indicadoresOficina1.map((ind) =>
                  parseFloat(ind.valor.toFixed(2))
                ),
              },
              {
                name: comparacionData?.nombreOficina2 || "Oficina 2",
                data: indicadoresOficina2.map((ind) =>
                  parseFloat(ind.valor.toFixed(2))
                ),
              },
            ]}
            type="bar"
            height={350}
          />
        </div>
      </Card>
    </div>
  );
};

export default GraficosComparacion;
