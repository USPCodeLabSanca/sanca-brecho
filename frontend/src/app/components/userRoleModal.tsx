"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UserCog } from "lucide-react";
import { UserType, UserRole } from "@/lib/types/api";
import { updateUserRole } from "@/lib/services/userService";

export type UserModalState = {
  user: UserType;
} | null;

interface UserRoleModalProps {
  modalState: UserModalState;
  setModalState: (state: UserModalState) => void;
  refetchUsers: () => void;
}

export function UserRoleModal({ modalState, setModalState, refetchUsers }: UserRoleModalProps) {
  // ALTERAÇÃO: O estado inicial agora é a string 'user'
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (modalState) {
      setSelectedRole(modalState.user.role);
    }
  }, [modalState]);

  const handleClose = () => setModalState(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalState) return;

    setIsSubmitting(true);
    try {
      await updateUserRole(modalState.user.slug, selectedRole);
      refetchUsers();
      handleClose();
    } catch (error) {
      console.error("Erro ao alterar cargo:", error);
      alert("Ocorreu um erro ao alterar o cargo do usuário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!modalState) return null;

  return (
    <Dialog.Root open={!!modalState} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Alterar Cargo do Usuário
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Selecione o novo cargo para {modalState.user.display_name}.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Cargo</label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sanca focus:ring-sanca sm:text-sm h-10 px-3"
              >
                <option value={UserRole.User}>Usuário</option>
                <option value={UserRole.Admin}>Administrador</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={handleClose} className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="cursor-pointer inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-sanca border border-transparent rounded-md shadow-sm hover:opacity-90 disabled:bg-gray-400">
                <UserCog className="w-4 h-4" />
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
          <Dialog.Close asChild>
            <button className="cursor-pointer absolute right-4 top-4 rounded-sm opacity-70">
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}