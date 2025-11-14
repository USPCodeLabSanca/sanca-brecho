"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Trash2 } from "lucide-react";
import { deleteMe } from "@/lib/services/userService";
import { signOutUser } from "@/lib/firebase/auth";
import { showErrorToast } from "@/lib/toast";

interface UserSelfDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserSelfDeleteModal({ isOpen, onClose, onSuccess }: UserSelfDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteMe();
      await signOutUser();
      onSuccess(); // Deixa a página de edição cuidar do toast e redirect
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      showErrorToast("Ocorreu um erro ao excluir sua conta.");
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed z-50 inset-0 bg-black/50" />
        <Dialog.Content className="fixed z-[60] left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Confirmar Exclusão de Conta
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Tem certeza que deseja excluir sua conta? Esta ação é permanente e não pode ser desfeita. Todos os seus anúncios e dados serão perdidos.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={handleDelete} disabled={isSubmitting} className="cursor-pointer inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:bg-gray-400">
              <Trash2 className="w-4 h-4" />
              {isSubmitting ? "Excluindo..." : "Excluir minha conta"}
            </button>
          </div>
          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}