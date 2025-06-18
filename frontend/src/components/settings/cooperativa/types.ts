import { CooperativaDTO, FormatoFecha, Idioma, ZonaHoraria } from 'shared/src/types/cooperativa.types';

export interface CooperativaFormProps {
  formData: Partial<CooperativaDTO> | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  canEdit: boolean;
}

export interface LogoUploaderProps {
  imagePreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onImageUpload: () => void;
  uploadingImage: boolean;
  canEdit: boolean;
}

export interface CooperativaConfigProps {
  canEditCooperativa?: boolean;
}
