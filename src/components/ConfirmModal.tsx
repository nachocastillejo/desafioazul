import React from 'react';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel, isDanger = false }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-xs">
        <p className="mb-4 text-center">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={isDanger ? "px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600" : "btn-primary"}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
