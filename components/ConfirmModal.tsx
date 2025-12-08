'use client';

import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const typeStyles = {
    danger: 'bg-secondary hover:bg-secondary/90',
    warning: 'bg-accent hover:bg-accent/90',
    info: 'bg-primary hover:bg-primary/90',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${typeStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-primary font-body">{message}</p>
    </Modal>
  );
}
