import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useData } from "../../../context/DataContext";
import { CooperativaDTO } from "shared/src/types/cooperativa.types";
import toast from "react-hot-toast";
import { CooperativaConfigProps } from "./types";
import { LogoUploader } from "./LogoUploader";
import { CooperativaForm } from "./CooperativaForm";
import {
  fetchCooperativaData,
  updateCooperativaData,
  uploadCooperativaLogo,
  validateLogoFile,
  hasFormChanges,
} from "./cooperativa-form.service";

export const CooperativaConfig: React.FC<CooperativaConfigProps> = ({
  canEditCooperativa,
}) => {
  const { actualizarDatosCooperativa, cargarDatosCooperativa } = useData();
  const [formData, setFormData] = useState<Partial<CooperativaDTO> | null>(
    null
  );
  const [originalData, setOriginalData] = useState<CooperativaDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para manejar la subida del logo
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Usar el permiso de edición del contexto
  const canEdit = canEditCooperativa ?? false;

  // Cargar datos directamente del backend al montar el componente
  useEffect(() => {
    const loadCooperativaData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cooperativaData = await fetchCooperativaData();
        if (cooperativaData) {
          setFormData(cooperativaData);
          if (cooperativaData.logo) {
            setImagePreview(cooperativaData.logo);
          }
          if (cooperativaData.id) {
            setOriginalData(cooperativaData);
          }
        }

        await cargarDatosCooperativa();
      } catch (err: any) {
        console.error("Error al cargar datos de la cooperativa:", err);
        setError(err.message || "Error al cargar datos de la cooperativa");
      } finally {
        setLoading(false);
      }
    };

    loadCooperativaData();
  }, [cargarDatosCooperativa]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateLogoFile(file)) {
      return;
    }

    // Crear URL para vista previa
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Función para eliminar la imagen seleccionada
  const handleClearImage = () => {
    setImagePreview(null);
    // Limpiar el input de archivo
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Función para subir el logo
  const handleImageUpload = async () => {
    if (!canEdit) return;

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast.error("No se ha seleccionado ninguna imagen");
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading("Subiendo logo...");

    try {
      // Subir imagen al backend
      const result = await uploadCooperativaLogo(file);

      // Actualizar URL en el formulario y en los datos originales
      if (result.imageUrl) {
        setFormData((prev) =>
          prev ? { ...prev, logo: result.imageUrl } : null
        );

        if (originalData) {
          setOriginalData({
            ...originalData,
            logo: result.imageUrl,
          });
        }

        // Actualizar también el contexto global
        await cargarDatosCooperativa();
      }

      toast.success("Logo actualizado correctamente", { id: toastId });

      // Mantener la vista previa con la URL real
      setImagePreview(result.imageUrl);
    } catch (err: any) {
      console.error("Error al subir el logo:", err);
      toast.error(err.message || "Error al subir el logo", { id: toastId });
    } finally {
      setUploadingImage(false);
      // Limpiar el input de archivo
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  // Guardar los cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !canEdit) return;

    // Verificar si realmente hay cambios para evitar llamadas innecesarias
    if (!hasFormChanges(originalData, formData)) {
      toast.success("No hay cambios que guardar");
      return;
    }

    const promise = async () => {
      try {
        setIsSaving(true);

        // Asegurarse de que tenemos el ID para la actualización
        if (!originalData?.id) {
          throw new Error("No se puede actualizar la cooperativa sin un ID");
        }

        // Llamada directa al backend
        await updateCooperativaData(formData, originalData.id);

        // Actualizar también el contexto global para que se refleje en toda la aplicación
        await actualizarDatosCooperativa(formData);

        // Actualizar los datos originales después de guardar exitosamente
        if (originalData) {
          setOriginalData({
            ...originalData,
            ...formData,
          });
        }

        return "Información actualizada correctamente";
      } catch (err: any) {
        console.error("Error al actualizar la cooperativa:", err);
        throw new Error(
          err.message || "Error al actualizar la información de la cooperativa"
        );
      } finally {
        setIsSaving(false);
      }
    };

    await toast.promise(promise(), {
      loading: "Guardando cambios...",
      success: "Información de la cooperativa actualizada correctamente",
      error: (err) =>
        `${
          err instanceof Error
            ? err.message
            : "Error al actualizar la información de la cooperativa"
        }`,
    });
  };

  if (loading || !formData) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Configuración de la Cooperativa
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 flex flex-wrap">
        {/* Sección compacta para el logo */}
        <div className="max-w-md bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow p-6 sm:p-8 border border-gray-200 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
          <h3 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-300 text-center">
            <span className="text-indigo-600">Logo</span> de la Cooperativa
          </h3>

          <LogoUploader
            imagePreview={imagePreview}
            onFileChange={handleFileChange}
            onClearImage={handleClearImage}
            onImageUpload={handleImageUpload}
            uploadingImage={uploadingImage}
            canEdit={canEdit}
          />
        </div>

        {/* Formulario principal */}
        <CooperativaForm
          formData={formData}
          onChange={handleChange}
          canEdit={canEdit}
        />

        <div className="pt-4">
          {canEdit ? (
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    <span>Guardar cambios</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Solo los administradores pueden modificar la información de
                    la cooperativa.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
