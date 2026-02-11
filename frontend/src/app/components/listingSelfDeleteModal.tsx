"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Trash2 } from "lucide-react";
import { ListingType } from "@/lib/types/api";
import { deleteListing } from "@/lib/services/listingService";
import { showErrorToast } from "@/lib/toast";
import { Button } from "./button";

interface ListingSelfDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingType;
  onSuccess: () => void;
}

export function ListingSelfDeleteModal({ isOpen, onClose, listing, onSuccess }: ListingSelfDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!listing) return;

    setIsSubmitting(true);
    try {
      await deleteListing(listing.id);
      onSuccess(); // Deixa a página de edição cuidar do toast e redirect
    } catch (error) {
      console.error("Erro ao excluir anúncio:", error);
      showErrorToast("Ocorreu um erro ao excluir o anúncio.");
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 z-[60] top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Confirmar Exclusão
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Tem certeza que deseja excluir o anúncio &quot;{listing.title}&quot;? Esta ação não pode ser desfeita.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={onClose} disabled={isSubmitting} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleDelete} disabled={isSubmitting} variant="danger">
              <Trash2 className="w-4 h-4" />
              {isSubmitting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </div>
          <Dialog.Close asChild>
            <Button variant="icon"className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}