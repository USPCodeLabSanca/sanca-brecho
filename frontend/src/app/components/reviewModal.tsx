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
import { Star } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

type ReviewModalProps = {
  productId: string;
  sellerId: string;
  onReviewSubmitted: (rating: number, comment: string) => void;
  triggerButton: React.ReactNode;
};

export function ReviewModal({
  onReviewSubmitted,
  triggerButton,
}: ReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      showErrorToast("Por favor, selecione uma avaliação de estrelas.");
      return;
    }
    try {
      setLoading(true);
      // Chamar o serviço para enviar a avaliação
      onReviewSubmitted(rating, comment);
      showSuccessToast("Avaliação enviada com sucesso!");
      setOpen(false);
      setRating(0);
      setComment("");
    } catch (err) {
      console.error(err);
      showErrorToast("Não foi possível enviar a avaliação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>

      <DialogOverlay className="fixed inset-0 bg-black/50" />

      <DialogContent className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Avaliar Produto e Vendedor</DialogTitle>
          <DialogDescription>
            Ajude a comunidade avaliando sua experiência.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <p className="block text-sm font-medium mb-2">Sua Avaliação:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <Star
                  key={starValue}
                  size={28}
                  className={`cursor-pointer ${
                    starValue <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(starValue)}
                />
              ))}
            </div>
          </div>

          <label className="block text-sm font-medium">
            Comentário (opcional)
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full mt-1 border rounded-md p-2 min-h-[80px]"
              placeholder="Descreva sua experiência..."
            />
          </label>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-md border hover:bg-gray-100">
              Cancelar
            </button>
          </DialogClose>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="px-4 py-2 rounded-md bg-sanca text-white hover:bg-sanca/90 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar Avaliação"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}