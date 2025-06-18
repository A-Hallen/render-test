import { CooperativaDTO } from 'shared/src/types/cooperativa.types';
import { obtenerCooperativa, actualizarCooperativa, subirLogoCooperativa } from '../../../services/cooperativa.service';
import toast from 'react-hot-toast';

export const fetchCooperativaData = async (): Promise<CooperativaDTO | null> => {
  try {
    const cooperativaData = await obtenerCooperativa();
    return cooperativaData || null;
  } catch (err: any) {
    console.error('Error al cargar datos de la cooperativa:', err);
    throw new Error(err.message || 'Error al cargar datos de la cooperativa');
  }
};

export const updateCooperativaData = async (
  formData: Partial<CooperativaDTO>,
  originalId: string
): Promise<CooperativaDTO> => {
  try {
    const datosActualizados = {
      ...formData,
      id: originalId
    };
    
    return await actualizarCooperativa(datosActualizados);
  } catch (err: any) {
    console.error('Error al actualizar la cooperativa:', err);
    throw new Error(err.message || 'Error al actualizar la información de la cooperativa');
  }
};

export const uploadCooperativaLogo = async (
  file: File
): Promise<{ imageUrl: string }> => {
  try {
    const result = await subirLogoCooperativa(file);
    return result;
  } catch (err: any) {
    console.error('Error al subir el logo:', err);
    throw new Error(err.message || 'Error al subir el logo');
  }
};

export const validateLogoFile = (file: File): boolean => {
  if (!file.type.startsWith('image/')) {
    toast.error('El archivo seleccionado no es una imagen');
    return false;
  }
  
  // Validar tamaño (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('La imagen no debe superar los 2MB');
    return false;
  }
  
  return true;
};

export const hasFormChanges = (
  originalData: CooperativaDTO | null, 
  formData: Partial<CooperativaDTO> | null
): boolean => {
  if (!originalData || !formData) return false;
  
  // Comparar cada propiedad relevante
  return (
    originalData.nombre !== formData.nombre ||
    originalData.ruc !== formData.ruc ||
    originalData.direccion !== formData.direccion ||
    originalData.telefono !== formData.telefono ||
    originalData.email !== formData.email ||
    originalData.zonaHoraria !== formData.zonaHoraria ||
    originalData.formatoFecha !== formData.formatoFecha ||
    originalData.idioma !== formData.idioma
  );
};
