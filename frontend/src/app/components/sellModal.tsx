"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
} from "@/app/components/dialog";
import { CheckCircle } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

type SellModalProps = {
  productId: string;
  onProductSold: (buyerId: string) => void;
  triggerClassName?: string;
};

export function SellModal({
  productId,
  onProductSold,
  triggerClassName,
}: SellModalProps) {
  const [open, setOpen] = useState(false);
  const [buyerId, setBuyerId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!buyerId) {
      showErrorToast("Por favor, insira o ID do comprador.");
      return;
    }
    try {
      setLoading(true);
      // TODO: Chamar o serviço para marcar o produto como vendido
      onProductSold(buyerId);
      showSuccessToast("Produto marcado como vendido!");
      setOpen(false);
    } catch (err) {
      console.error(err);
      showErrorToast("Não foi possível marcar o produto como vendido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca-dark ${
            triggerClassName ?? ""
          }`}
        >
          <CheckCircle /> Marcar como Vendido
        </button>
      </DialogTrigger>

      <DialogOverlay className="fixed inset-0 bg-black/50" />

      <DialogContent className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Marcar Produto como Vendido</DialogTitle>
          <DialogDescription>
            Para quem você vendeu este produto?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <label className="block text-sm font-medium">
            ID do Comprador
            <input
              type="text"
              value={buyerId}
              onChange={(e) => setBuyerId(e.target.value)}
              className="w-full mt-1 border rounded-md p-2"
              placeholder="Insira o ID do usuário que comprou"
            />
          </label>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-2">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-md border hover:bg-gray-100">
              Cancelar
            </button>
          </DialogClose>
          <button
            onClick={handleSubmit}
            disabled={!buyerId || loading}
            className="px-4 py-2 rounded-md bg-sanca text-white hover:bg-sanca/90 disabled:opacity-50"
          >
            {loading ? "Marcando..." : "Confirmar Venda"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}