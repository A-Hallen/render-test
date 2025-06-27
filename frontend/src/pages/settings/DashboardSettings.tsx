import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  X,
  LayoutDashboard,
  GripVertical,
  ArrowLeft,
} from "lucide-react";
import {
  loadDashboardCards,
  saveDashboardCards,
} from "../../services/dashboardSettings.service";
import { DashboardCard } from "shared";

export const DashboardSettings: React.FC = () => {
  const navigate = useNavigate();
  const [newAccountCode, setNewAccountCode] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [dashboardCards, setDashboardCard] = useState<DashboardCard[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const initialCards = await loadDashboardCards();
        if (initialCards) {
          setDashboardCard(initialCards);
        }
      } catch (error) {
        console.error("Error al cargar configuración", error);
        toast.error("Error al cargar la configuración.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleAccount = (code: string, name: string) => {
    const exists = dashboardCards.some((c) => c.accountCode === code);
    let updated: DashboardCard[];
    if (exists) {
      updated = dashboardCards
        .filter((c) => c.accountCode !== code)
        .map((c, i) => ({ ...c, order: i + 1 }));
    } else {
      const nextOrder =
        Math.max(0, ...dashboardCards.map((c) => c.order || 0)) + 1;
      updated = [
        ...dashboardCards,
        {
          accountCode: code,
          accountName: name,
          visible: true,
          order: nextOrder,
        },
      ];
    }
    setDashboardCard(updated);
    setHasChanges(true);
  };

  const moveCard = (index: number, direction: "up" | "down") => {
    const newCards = [...dashboardCards].sort((a, b) => a.order - b.order);
    if (direction === "up" && index > 0) {
      [newCards[index], newCards[index - 1]] = [
        newCards[index - 1],
        newCards[index],
      ];
    } else if (direction === "down" && index < newCards.length - 1) {
      [newCards[index], newCards[index + 1]] = [
        newCards[index + 1],
        newCards[index],
      ];
    }
    const reordered = newCards.map((c, i) => ({ ...c, order: i + 1 }));
    setDashboardCard(reordered);
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      console.log("guardando cambios...")
      await saveDashboardCards(dashboardCards);
      setHasChanges(false);
      toast.success("Cambios guardados correctamente.");
    } catch (error) {
      console.error("Error al guardar cambios", error);
      toast.error("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full pt-[var(--header-height)] bg-gray-50">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")}
            className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={22} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <LayoutDashboard className="mr-2 text-blue-600" size={24} />
            Configuración del Dashboard
          </h1>
        </div>
        {hasChanges && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={saveChanges}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-sm transition ${saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white`}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 py-1">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-medium text-gray-800 mb-3">
            Agregar cuenta por código
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              placeholder="Código de cuenta"
              className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newAccountCode}
              onChange={(e) => setNewAccountCode(e.target.value)}
              onKeyPress={(e) => {
                if (
                  e.key === "Enter" &&
                  newAccountCode.trim() &&
                  newAccountName.trim()
                ) {
                  toggleAccount(
                    newAccountCode.trim(),
                    newAccountName.trim()
                  );
                  setNewAccountCode("");
                  setNewAccountName("");
                }
              }}
            />
            <input
              type="text"
              placeholder="Nombre de cuenta"
              className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              onKeyPress={(e) => {
                if (
                  e.key === "Enter" &&
                  newAccountCode.trim() &&
                  newAccountName.trim()
                ) {
                  toggleAccount(
                    newAccountCode.trim(),
                    newAccountName.trim()
                  );
                  setNewAccountCode("");
                  setNewAccountName("");
                }
              }}
            />
            <button
              onClick={() => {
                if (newAccountCode.trim() && newAccountName.trim()) {
                  toggleAccount(
                    newAccountCode.trim(),
                    newAccountName.trim()
                  );
                  setNewAccountCode("");
                  setNewAccountName("");
                }
              }}
              className="px-4 flex-grow py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              Agregar
            </button>
          </div>
          <div className="text-center text-gray-400 py-8 text-sm">
            Ingrese el código y el nombre de la cuenta para agregarla al dashboard.
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Tarjetas del Dashboard
          </h2>
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 p-1 rounded-md bg-gray-100 animate-pulse mb-2"
                />
              ))
            ) : dashboardCards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-400 py-8"
              >
                No hay tarjetas configuradas.
              </motion.div>
            ) : (
              <Reorder.Group
                axis="y"
                values={dashboardCards.sort((a, b) => a.order - b.order)}
                onReorder={(newOrder) => {
                  const reordered = newOrder.map((c, i) => ({
                    ...c,
                    order: i + 1,
                  }));
                  setDashboardCard(reordered);
                  setHasChanges(true);
                }}
                className="space-y-2"
              >
                {dashboardCards
                  .sort((a, b) => a.order - b.order)
                  .map((card, index) => (
                    <Reorder.Item
                      key={card.accountCode}
                      value={card}
                      layoutId={card.accountCode}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                      className="border border-gray-200 rounded-md bg-gray-50 shadow-sm"
                    >
                      <div className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-2">
                          <GripVertical
                            size={16}
                            className="text-gray-400 cursor-grab"
                          />
                          <div>
                            <div className="font-medium text-gray-800 text-sm">
                              {card.accountName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {card.accountCode}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveCard(index, "up")}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:text-gray-300"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            onClick={() => moveCard(index, "down")}
                            disabled={index === dashboardCards.length - 1}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:text-gray-300"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            onClick={() =>
                              toggleAccount(card.accountCode, card.accountName)
                            }
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
              </Reorder.Group>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
