import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter
} from './Modal';
import { Button } from './Button';
import { Input } from './Input';

export interface ActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  promptLabel?: string;
  isDanger?: boolean;
  onConfirm: (val?: string) => void;
  onCancel: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  title,
  message,
  promptLabel,
  isDanger,
  onConfirm,
  onCancel
}) => {
  const [val, setVal] = React.useState('');
  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{message}</ModalDescription>
          {promptLabel && (
            <div className="mt-4 text-left">
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">{promptLabel}</label>
              <Input value={val} onChange={(e) => setVal(e.target.value)} />
            </div>
          )}
        </ModalHeader>
        <ModalFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={() => onConfirm(promptLabel ? val : undefined)}>
            Confirmar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
