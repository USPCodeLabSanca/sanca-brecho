"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Trash2 } from "lucide-react";
import { ListingType } from "@/lib/types/api";
import { deleteListingByAdmin } from "@/lib/services/listingService";
import { Button } from "./button";

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
      await deleteListingByAdmin(String(modalState.listing.id));
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
            Tem certeza que deseja excluir o anúncio &quot;{modalState.listing.title}&quot;? Esta ação não pode ser desfeita.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={handleClose} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleDelete} disabled={isSubmitting} variant="danger">
              <Trash2 className="w-4 h-4" />
              {isSubmitting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </div>
          <Dialog.Close asChild>
            <Button variant="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}