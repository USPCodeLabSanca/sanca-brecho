"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { CategoryType } from "@/lib/types/api";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/services/categoryService";

export type ModalState =
  | { type: "add" }
  | { type: "edit"; category: CategoryType }
  | { type: "delete"; category: CategoryType }
  | null;

interface CategoryModalProps {
  modalState: ModalState;
  setModalState: (state: ModalState) => void;
  refetchCategories: () => void;
}

export function CategoryModal({
  modalState,
  setModalState,
  refetchCategories,
}: CategoryModalProps) {
  // Estados manuais para o formulário
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para preencher o nome quando o modal abre em modo de edição
  useEffect(() => {
    if (modalState?.type === "edit") {
      setName(modalState.category.name);
    } else {
      setName(""); // Limpa para o modo de adição
    }
    setError(null); // Sempre limpa os erros ao abrir
  }, [modalState]);

  const handleClose = () => setModalState(null);

  // Função de validação manual
  const validateName = () => {
    if (name.trim().length < 2) {
      setError("O nome da categoria deve ter pelo menos 2 caracteres.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateName()) return;

    if (modalState?.type !== "add" && modalState?.type !== "edit") return;

    setIsSubmitting(true);
    try {
      if (modalState.type === "add") {
        await createCategory({ name, icon: "default", parent_id: null });
      } else {
        await updateCategory(modalState.category.id, { name });
      }
      refetchCategories();
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      // Opcional: você poderia usar o estado de erro para mostrar uma mensagem
      setError("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (modalState?.type !== "delete") return;

    setIsSubmitting(true);
    try {
      await deleteCategory(modalState.category.id);
      refetchCategories();
      handleClose();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Ocorreu um erro ao excluir. Verifique se a categoria não está em uso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAddOrEdit = modalState?.type === "add" || modalState?.type === "edit";

  if (!modalState) return null;

  return (
    <Dialog.Root open={!!modalState} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {modalState.type === "add" && "Nova Categoria"}
            {modalState.type === "edit" && "Editar Categoria"}
            {modalState.type === "delete" && "Confirmar Exclusão"}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            {modalState.type === "add" && "Crie uma nova categoria para organizar os anúncios."}
            {modalState.type === "edit" && "Altere o nome da categoria selecionada."}
            {modalState.type === "delete" && `Tem certeza que deseja excluir a categoria "${modalState.category.name}"?`}
          </Dialog.Description>

          {isAddOrEdit ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Categoria
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ex: Eletrônicos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sanca focus:ring-sanca sm:text-sm h-10 px-3"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-sanca border border-transparent rounded-md shadow-sm hover:opacity-90 disabled:bg-gray-400">
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isSubmitting} className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:bg-gray-400">
                {isSubmitting ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          )}

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70">
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}