import React from 'react';

interface ConfirmModalProps {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  icon?: React.ReactElement;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isDanger = false,
  icon
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        {icon && <div className="flex justify-center mb-4">{icon}</div>}
        {title && <h3 className="text-lg font-semibold text-center mb-2 text-text-primary dark:text-white">{title}</h3>}
        <p className="mb-4 text-center text-text-secondary dark:text-gray-300">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={onCancel} 
            className="btn-secondary w-full sm:w-auto px-4 py-2 rounded-md"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${isDanger ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary-hover"} text-white px-4 py-2 rounded-md w-full sm:w-auto`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
