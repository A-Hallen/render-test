import React, { useEffect, useState } from "react";
import { KpiCard } from "./KpiCard";
import { IndicadorFinancieroCard } from "./IndicadorFinancieroCard/IndicadorFinancieroCard";
import { IndicadorFinancieroSkeleton } from "./IndicadorFinancieroCard/IndicadorFinancieroSkeleton";
import { httpClient } from "../../services/httpClient";
import { DashboardData } from "shared";
import {
  Wallet, // Keeping Wallet as it's used in KpiCard fallback
  CreditCard,
} from "lucide-react";
import { useOficinas } from "../../context/DataContext";

// CardsSection.tsx
export const CardsSection: React.FC = () => {
  const { oficinaSeleccionada } = useOficinas();
  const [allCardsData, setAllCardsData] = useState<Record<
    string,
    DashboardData
  > | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skeletonCount, setSkeletonCount] = useState<number>(4); // Valor por defecto

  useEffect(() => {
    const fetchAllCardsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpClient.fetch(
          `/api/dashboard/cards?oficina=${oficinaSeleccionada?.codigo}`
        );
        const cards = response.dashboardCards;

        // Guardar el número de cards en localStorage
        const count = Object.keys(cards).length;
        localStorage.setItem("dashboardCardsCount", count.toString());
        setSkeletonCount(count);

        setAllCardsData(cards as Record<string, DashboardData>);
      } catch (err) {
        console.error("Error fetching all dashboard cards:", err);
        setError(
          "No se pudieron cargar los datos de los indicadores financieros."
        );

        // Intentar obtener el count de localStorage si falla la petición
        const storedCount = localStorage.getItem("dashboardCardsCount");
        if (storedCount) {
          setSkeletonCount(parseInt(storedCount));
        }
      } finally {
        setLoading(false);
      }
    };

    if (oficinaSeleccionada) {
      // Intentar obtener el count de localStorage antes de hacer la petición
      const storedCount = localStorage.getItem("dashboardCardsCount");
      if (storedCount) {
        setSkeletonCount(parseInt(storedCount));
      }
      fetchAllCardsData();
    }
  }, [oficinaSeleccionada]);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <IndicadorFinancieroSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
        <p>{error}</p>
      </div>
    );
  }

  if (!allCardsData || Object.keys(allCardsData).length === 0) {
    return (
      <div className="text-gray-500 p-4 border border-gray-200 rounded-md bg-gray-50">
        <p>No hay datos disponibles para los indicadores financieros.</p>
      </div>
    );
  }

  return (
    <>
      {Object.entries(allCardsData).map(([key, dataForCard]) => {
        const title = key.charAt(0).toUpperCase() + key.slice(1); // Basic capitalization for title
        if (!dataForCard) {
          return (
            <KpiCard
              key={key}
              title={title}
              value="N/A"
              change={0}
              icon={React.createElement(Wallet, { size: 20 })} // Generic icon as fallback
              color="red" // Default color as fallback
              description={`Datos no disponibles para ${title.toLowerCase()}`}
            />
          );
        }
        return (
          <IndicadorFinancieroCard
            key={key}
            title={dataForCard.title || ""}
            icon={React.createElement(CreditCard, { size: 20 })} // Generic icon
            color="blue" // Default color
            data={dataForCard}
          />
        );
      })}
    </>
  );
};
