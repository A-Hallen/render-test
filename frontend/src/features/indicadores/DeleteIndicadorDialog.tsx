import React, { forwardRef, useImperativeHandle } from 'react';
import { IndicadorResponse } from 'shared/src/types/indicadores.types';

interface DeleteIndicadorDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  indicador?: IndicadorResponse | null;
}

export type DeleteIndicadorDialogHandle = {
  open: () => void;
  close: () => void;
};

const DeleteIndicadorDialog = forwardRef<DeleteIndicadorDialogHandle, DeleteIndicadorDialogProps>(
  ({ onClose, onConfirm, indicador }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const open = () => {
      setIsOpen(true);
    };

    const close = () => {
      setIsOpen(false);
      onClose();
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    return (
      <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={close} />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Estás seguro de eliminar el indicador
                <span className="font-bold" style={{ color: indicador?.color ?? 'red' }}> {indicador?.nombre}</span>
                 ?
              </h3>
              <div className="flex justify-end gap-4">
                <button
                  onClick={close}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    close();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DeleteIndicadorDialog.displayName = 'DeleteIndicadorDialog';

export default DeleteIndicadorDialog;
