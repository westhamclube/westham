'use client';

import React from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="max-w-md w-full bg-neutral-900 border-2 border-neutral-700 shadow-2xl">
        <h3 className="text-xl font-bold text-neutral-100 mb-2">{title}</h3>
        <p className="text-neutral-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} className="bg-neutral-700 text-neutral-100 hover:bg-neutral-600">
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
