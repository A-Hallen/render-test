import React, { useEffect, useState, useRef } from "react";
import { Plus } from "lucide-react";
import { IndicadoresList } from "../../features/indicadores/indicadoresList";
import Modal, { ModalHandle } from "../../features/indicadores/formulaView";
import { IndicadorEditor } from "../../features/indicadores/IndicadorEditor";
import DeleteIndicadorDialog, {
  DeleteIndicadorDialogHandle,
} from "../../features/indicadores/DeleteIndicadorDialog";

// Definimos localmente la interfaz para evitar problemas de importación
interface IndicadorResponse {
  id: string;
  nombre: string;
  descripcion: string;
  formula: string;
  color: string;
  unidad?: string;
  formatoNumero?: string;
  orden?: number;
  activo?: boolean;
}

// Eliminamos la interfaz Formula ya que no se utiliza en este componente

export const KpiFormulaEditor: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadorResponse[]>([]);
  const [editIndicador, setEditIndicador] = useState<IndicadorResponse | null>(
    null
  );
  const [formulaSelected, setFormulaSelected] =
    useState<IndicadorResponse | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [indicadorSeleccionado, setIndicadorSeleccionado] =
    useState<IndicadorResponse | null>(null);
  const modalRef = useRef<ModalHandle>(null);
  const deleteDialogRef = useRef<DeleteIndicadorDialogHandle>(null);

  useEffect(() => {
    try {
      fetch(`/api/indicadores-contables`).then((response) =>
        response.json().then((data) => {
          if(data.error){
            throw new Error(data.error);
          }
          setIndicadores(data);
        })
      );
    } catch (error) {
      console.error("Error al obtener los indicadores", error);
    }
  }, []);

  const showFormula = (indicador: IndicadorResponse) => {
    setFormulaSelected(indicador);
    modalRef.current?.openModal();
  };


  // Eliminamos las categorías no utilizadas en este componente

  const handleDelete = async (indicador?: IndicadorResponse | null) => {
    setIndicadorSeleccionado(null);
    if (!indicador) return;
    deleteDialogRef.current?.close();
    await fetch(`/api/indicadores-contables/${indicador.id}`, {
      method: "DELETE",
    }).then(() => {
      try {
        fetch(`/api/indicadores-contables`).then((response) =>
          response.json().then((data) => {
            console.log(data);
            setIndicadores(data);
          })
        );
      } catch (error) {
        console.error("Error al obtener los indicadores", error);
      }
    });
  };

  const createUpdateIndicador = async (indicador: IndicadorResponse) => {
    setIndicadores(
      indicadores.map((i) => (i.id === indicador.id ? indicador : i))
    );
    const url = editIndicador
      ? `/api/indicadores-contables/${editIndicador.id}`
      : "/api/indicadores-contables";
    const method = editIndicador ? "PUT" : "POST";
    await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(indicador),
    }).then(() => {
      try {
        fetch(`/api/indicadores-contables`).then((response) =>
          response.json().then((data) => {
            console.log(data);
            setIndicadores(data);
          })
        );
      } catch (error) {
        console.error("Error al obtener los indicadores", error);
      }
    });
    setShowEditor(false);
  };

  const showDeleteDialog = (indicador: IndicadorResponse) => {
    setIndicadorSeleccionado(indicador);
    deleteDialogRef.current?.open();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Configuración de Indicadores
          </h2>
          <p className="text-sm text-gray-600">
            Define y personaliza las fórmulas de cálculo para indicadores
          </p>
        </div>
        <button
          onClick={() => {
            setEditIndicador(null);
            setShowEditor(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition"
        >
          <Plus size={18} className="mr-2" />
          Nuevo KPI
        </button>
      </div>

      {showEditor && (
        <IndicadorEditor
          indicador={editIndicador}
          onSubmit={(indicador: IndicadorResponse) =>
            createUpdateIndicador(indicador)
          }
          onCancel={() => setShowEditor(false)}
        />
      )}
      {indicadores ? (
        <IndicadoresList
          indicadores={indicadores}
          setShowEditor={setShowEditor}
          setEditIndicador={setEditIndicador}
          setFormulaSelected={showFormula}
          handleDelete={(indicador: IndicadorResponse) =>
            showDeleteDialog(indicador)
          }
        />
      ) : (
        <>Error al obtener la lista de indicadores</>
      )}
      <Modal
        ref={modalRef}
        setIndicadores={(indicador: IndicadorResponse) =>
          createUpdateIndicador(indicador)
        }
        indicador={formulaSelected}
      />
      <DeleteIndicadorDialog
        ref={deleteDialogRef}
        indicador={indicadorSeleccionado}
        onClose={() => setIndicadorSeleccionado(null)}
        onConfirm={() => handleDelete(indicadorSeleccionado)}
      />
    </div>
  );
};
