import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  ConfiguracionReporteDTO,
  CuentaData,
} from "shared/src/types/reportes.types";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export type CrearEditarConfiguracionHandle = {
  openModal: (configuracion?: ConfiguracionReporteDTO) => void;
  closeModal: () => void;
};

interface CrearEditarConfiguracionProps {
  onSave?: (configuracion: ConfiguracionReporteDTO) => void;
  onEdit?: (configuracion: ConfiguracionReporteDTO) => void;
}

type Categoria = {
  nombre: string;
  cuentas: string[];
};

export const CrearEditarConfiguracionView = forwardRef<
  CrearEditarConfiguracionHandle,
  CrearEditarConfiguracionProps
>(({ onSave, onEdit }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cuentas, setCuentas] = useState<CuentaData[]>([]);
  const [configuracion, setConfiguracion] = useState<
    Partial<ConfiguracionReporteDTO>
  >({
    nombre: "",
    descripcion: "",
    categorias: [{ nombre: "", cuentas: [] }],
    esActivo: true,
  });
  const [esEdicion, setEsEdicion] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [busquedaCuenta, setBusquedaCuenta] = useState<{
    [key: number]: string;
  }>({});
  const [cuentasFiltradas, setCuentasFiltradas] = useState<{
    [key: number]: CuentaData[];
  }>({});

  const openModal = (configuracionExistente?: ConfiguracionReporteDTO) => {
    if (configuracionExistente) {
      // Reset busquedaCuenta y cuentasFiltradas
      const busquedaInicial: { [key: number]: string } = {};
      const cuentasFiltradasInicial: { [key: number]: CuentaData[] } = {};

      // Inicializar los estados de búsqueda para cada categoría
      console.log("cat", configuracionExistente.categorias)
      configuracionExistente.categorias?.forEach((_, index) => {
        busquedaInicial[index] = '';
        cuentasFiltradasInicial[index] = [];
      });
      
      setBusquedaCuenta(busquedaInicial);
      setCuentasFiltradas(cuentasFiltradasInicial);
      
      setConfiguracion({
        ...configuracionExistente,
        categorias: [...configuracionExistente.categorias],
      });
      setEsEdicion(true);
    } else {
      setBusquedaCuenta({ 0: '' });
      setCuentasFiltradas({ 0: [] });
      setConfiguracion({
        nombre: "",
        descripcion: "",
        categorias: [{ nombre: "", cuentas: [] }],
        esActivo: true,
      });
      setEsEdicion(false);
    }
    setIsOpen(true);
    setTimeout(() => setIsVisible(true), 100);
  };

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      setConfiguracion({
        nombre: "",
        descripcion: "",
        categorias: [{ nombre: "", cuentas: [] }],
        esActivo: true,
      });
    }, 300);
  };

  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
  }));

  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reportes/cuentas");
        const data = await response.json();
        setCuentas(data.cuentas || []);
      } catch (error) {
        console.error("Error cargando cuentas:", error);
        toast.error("Error al cargar las cuentas");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      cargarCuentas();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!configuracion.nombre?.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (configuracion.categorias?.some((cat) => !cat.nombre.trim())) {
      toast.error("Todas las categorías deben tener un nombre");
      return;
    }
    if(esEdicion && onEdit){
      onEdit(configuracion as ConfiguracionReporteDTO);
    } else if (onSave) {
      onSave(configuracion as ConfiguracionReporteDTO);
    }
    closeModal();
  };

  const agregarCategoria = () => {
    const newIndex = configuracion.categorias?.length || 0;
    setBusquedaCuenta(prev => ({
      ...prev,
      [newIndex]: ""
    }));
    setCuentasFiltradas(prev => ({
      ...prev,
      [newIndex]: []
    }));
    
    setConfiguracion((prev) => ({
      ...prev,
      categorias: [...(prev.categorias || []), { nombre: "", cuentas: [] }],
    }));
  };

  const eliminarCategoria = (index: number) => {
    if (configuracion.categorias && configuracion.categorias.length <= 1) {
      toast.error("Debe haber al menos una categoría");
      return;
    }

    // Actualizar los índices de búsqueda
    const newBusqueda = { ...busquedaCuenta };
    const newCuentasFiltradas = { ...cuentasFiltradas };
    
    // Eliminar la categoría y actualizar los índices
    delete newBusqueda[index];
    delete newCuentasFiltradas[index];
    
    // Reindexar las categorías restantes
    const updatedBusqueda: { [key: number]: string } = {};
    const updatedCuentasFiltradas: { [key: number]: CuentaData[] } = {};
    
    Object.entries(newBusqueda).forEach(([key, value], i) => {
      updatedBusqueda[i] = value;
      updatedCuentasFiltradas[i] = newCuentasFiltradas[Number(key)] || [];
    });
    
    setBusquedaCuenta(updatedBusqueda);
    setCuentasFiltradas(updatedCuentasFiltradas);

    setConfiguracion((prev) => ({
      ...prev,
      categorias: prev.categorias?.filter((_, i) => i !== index) || [],
    }));
  };

  const actualizarCategoria = (
    index: number,
    campo: keyof Categoria,
    valor: any
  ) => {
    const nuevasCategorias = [...(configuracion.categorias || [])];
    nuevasCategorias[index] = { ...nuevasCategorias[index], [campo]: valor };

    setConfiguracion((prev) => ({
      ...prev,
      categorias: nuevasCategorias,
    }));
  };

  const filtrarCuentas = (termino: string, catIndex: number) => {
    if (!termino.trim()) {
      setCuentasFiltradas((prev) => ({
        ...prev,
        [catIndex]: [],
      }));
      return;
    }

    const filtradas = cuentas.filter(
      (cuenta) =>
        cuenta.CODIGO.toString().includes(termino) ||
        cuenta.NOMBRE.toLowerCase().includes(termino.toLowerCase())
    );

    setCuentasFiltradas((prev) => ({
      ...prev,
      [catIndex]: filtradas.slice(0, 10), // Limitar a 10 resultados
    }));
  };

  const agregarCuenta = (catIndex: number, cuenta: CuentaData) => {
    const categoria = configuracion.categorias?.[catIndex];
    if (!categoria) return;

    // Verificar si la cuenta ya existe en la categoría
    if (categoria.cuentas.includes(cuenta.CODIGO.toString())) {
      toast.error("Esta cuenta ya está agregada");
      return;
    }

    const nuevasCategorias = [...(configuracion.categorias || [])];
    nuevasCategorias[catIndex] = {
      ...nuevasCategorias[catIndex],
      cuentas: [...nuevasCategorias[catIndex].cuentas, cuenta.CODIGO.toString()],
    };

    setConfiguracion((prev) => ({
      ...prev,
      categorias: nuevasCategorias,
    }));

    // Limpiar la búsqueda después de agregar
    setBusquedaCuenta((prev) => ({
      ...prev,
      [catIndex]: "",
    }));
    setCuentasFiltradas((prev) => ({
      ...prev,
      [catIndex]: [],
    }));
  };

  const eliminarCuenta = (catIndex: number, codigoCuenta: string) => {
    const categoria = configuracion.categorias?.[catIndex];
    if (!categoria) return;

    const nuevasCuentas = categoria.cuentas.filter(
      (c: string) => c !== codigoCuenta
    );
    actualizarCategoria(catIndex, "cuentas", nuevasCuentas);
  };

  const getCuentaPorCodigo = (codigo: string) => {
    return cuentas.find((c) => c.CODIGO.toString() === codigo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 h-full">
        {/* Fondo oscuro con transición */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isVisible ? "opacity-50" : "opacity-0"
          }`}
          onClick={closeModal}
        />

        {/* Contenido del modal con animación de escala */}
        <div
          className={`relative w-full h-full overflow-y-auto max-w-4xl bg-white rounded-lg shadow-xl transform transition-all duration-300 ${
            isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {esEdicion ? "Editar Configuración" : "Nueva Configuración"}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Formulario */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <div className="w-full max-w-md">
                <div className="flex items-center justify-around gap-4 w-full">
                  <input
                    type="text"
                    id="nombre"
                    value={configuracion.nombre || ""}
                    required
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        nombre: e.target.value,
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus-visible:ring-blue-500 focus-visible:border-blue-500 block w-full p-2.5"
                    placeholder="nombre"
                  />
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      checked={configuracion.esActivo ?? true}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          esActivo: e.target.checked,
                        })
                      }
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900">
                      Activo
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <textarea
              id="message"
              rows={4}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción"
              value={configuracion.descripcion || ""}
              onChange={(e) =>
                setConfiguracion({
                  ...configuracion,
                  descripcion: e.target.value,
                })
              }
            ></textarea>

            {/* Sección de categorías */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Categorías
                </h4>
                <button
                  type="button"
                  onClick={agregarCategoria}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Categoría
                </button>
              </div>

              <div className="space-y-4">
                {configuracion.categorias?.map((categoria, catIndex) => (
                  <div key={catIndex} className="p-4 border rounded-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-full max-w-md">
                        <div className="flex mt-1 space-x-2">
                          <input
                            type="text"
                            id={`categoria-${catIndex}`}
                            value={categoria.nombre}
                            required
                            onChange={(e) =>
                              actualizarCategoria(
                                catIndex,
                                "nombre",
                                e.target.value
                              )
                            }
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus-visible:ring-blue-500 focus-visible:border-blue-500 block w-full p-2.5"
                            placeholder="nombre de la categoría"
                          />
                          <button
                            type="button"
                            onClick={() => eliminarCategoria(catIndex)}
                            className="px-3 text-red-600 rounded-md hover:bg-red-50"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuentas
                      </label>

                      {/* Buscador de cuentas */}
                      <div className="relative mb-2">
                        <input
                          type="text"
                          value={busquedaCuenta[catIndex] || ""}
                          onChange={(e) => {
                            setBusquedaCuenta((prev) => ({
                              ...prev,
                              [catIndex]: e.target.value,
                            }));
                            filtrarCuentas(e.target.value, catIndex);
                          }}
                          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Buscar cuenta por código o nombre..."
                        />

                        {/* Resultados de búsqueda */}
                        {busquedaCuenta[catIndex] &&
                          cuentasFiltradas[catIndex]?.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                              {cuentasFiltradas[catIndex].map((cuenta) => (
                                <div
                                  key={cuenta.CODIGO}
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() =>
                                    agregarCuenta(catIndex, cuenta)
                                  }
                                >
                                  <span className="font-medium">
                                    {cuenta.CODIGO}
                                  </span>{" "}
                                  - {cuenta.NOMBRE}
                                </div>
                              ))}
                            </div>
                          )}

                        {busquedaCuenta[catIndex] &&
                          cuentasFiltradas[catIndex]?.length === 0 && (
                            <div className="absolute z-10 w-full p-2 mt-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md">
                              No se encontraron cuentas
                            </div>
                          )}
                      </div>

                      {/* Cuentas seleccionadas */}
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {categoria.cuentas.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No hay cuentas seleccionadas
                          </p>
                        ) : (
                          categoria.cuentas.map((codigo: string) => {
                            const cuenta = getCuentaPorCodigo(codigo);
                            if (!cuenta) return null;

                            return (
                              <div
                                key={codigo}
                                className="flex items-center justify-between p-1 text-sm bg-gray-50 rounded"
                              >
                                <span>
                                  <span className="font-medium">
                                    {cuenta.CODIGO}
                                  </span>{" "}
                                  - {cuenta.NOMBRE}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarCuenta(catIndex, codigo)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                  title="Quitar cuenta"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <p className="mt-1 text-xs text-gray-500 ml-1">
                        {categoria.cuentas.length} cuenta
                        {categoria.cuentas.length !== 1 ? "s" : ""} seleccionada
                        {categoria.cuentas.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end pt-5 space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

CrearEditarConfiguracionView.displayName = "CrearEditarConfiguracionView";
