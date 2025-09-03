"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Trash2 } from "lucide-react";
import { ListingType } from "@/lib/types/api";
import { deleteListing } from "@/lib/services/listingService";

export type ListingModalState = {
  listing: ListingType;
} | null;

interface ListingDeleteModalProps {
  modalState: ListingModalState;
  setModalState: (state: ListingModalState) => void;
  refetchListings: () => void;
}

export function ListingDeleteModal({ modalState, setModalState, refetchListings }: ListingDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => setModalState(null);

  const handleDelete = async () => {
    if (!modalState) return;
    
    setIsSubmitting(true);
    try {
      await deleteListing(String(modalState.listing.id));
      refetchListings();
      handleClose();
    } catch (error) {
      console.error("Erro ao excluir anúncio:", error);
      alert("Ocorreu um erro ao excluir o anúncio.");
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
            Confirmar Exclusão
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Tem certeza que deseja excluir o anúncio "{modalState.listing.title}"? Esta ação não pode ser desfeita.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={handleDelete} disabled={isSubmitting} className="inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:bg-gray-400">
              <Trash2 className="w-4 h-4" />
              {isSubmitting ? "Excluindo..." : "Confirmar Exclusão"}
            </button>
          </div>
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