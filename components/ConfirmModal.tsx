'use client';

import Modal from './Modal';
import { Icons } from '@/config/icons';

interface ProgressStep {
  message: string;
  timestamp: number;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  progress?: ProgressStep[];
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
  isLoading = false,
  progress = [],
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const typeStyles = {
    danger: 'bg-secondary hover:bg-secondary/90',
    warning: 'bg-accent hover:bg-accent/90',
    info: 'bg-primary hover:bg-primary/90',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${typeStyles[type]} ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <div>
        <p className="text-primary font-body">{message}</p>
        
        {isLoading && progress.length > 0 && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded bg-background/50">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent" />
            <p className="text-sm text-secondary font-body">
              {progress[progress.length - 1].message}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
