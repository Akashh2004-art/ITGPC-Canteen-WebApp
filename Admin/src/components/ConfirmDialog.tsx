import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info'; // ✅ Added 'info'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  // ✅ Styles for all variants
  const iconBgStyles = {
    danger: 'bg-destructive/10',
    warning: 'bg-amber-100',
    info: 'bg-blue-100',
  };

  const iconColorStyles = {
    danger: 'text-destructive',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  const buttonStyles = {
    danger: 'bg-destructive hover:bg-destructive/90',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info: 'bg-blue-500 hover:bg-blue-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-card rounded-xl shadow-xl p-6 animate-scale-in">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${iconBgStyles[variant]}`}>
            <AlertTriangle className={`w-6 h-6 ${iconColorStyles[variant]}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-muted-foreground">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={buttonStyles[variant]}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}