import React, { useState } from "react";
import { ReviewType, SaleType } from '@/lib/types/api';
import { createReview } from "@/lib/services/saleService";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import StarRating from "./starRating";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleType;
  onSuccess: (newReview: ReviewType) => void;
}

const CreateReviewModal: React.FC<ModalProps> = ({ isOpen, onClose, sale, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const commentMaxLenght = 255;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (rating === 0) {
      setError("Por favor, selecione uma nota de 1 a 5 estrelas.");      
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await createReview(sale.id, rating, comment);
    setIsLoading(false);

    if ('error' in result) {
      setError(result.error);
      toast.error(error);
    } else {
      toast.success('Vendedor avaliado com sucesso!');
      onSuccess(result);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="flex flex-col bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold">Avaliar {sale.seller.display_name}</h1>
          <button onClick={onClose} disabled={isLoading} className="cursor-pointer text-sm text-black font-medium disabled:pointer-events-none"><X /></button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-center py-4">
            <StarRating rating={rating} setRating={setRating}/>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comentário (opcional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={commentMaxLenght}
              placeholder="Conte como foi sua experiência com o vendedor..."
              className="text-sm mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm min-h-[100px]"
            />
            <p className="text-xs text-gray-500 my-2">{commentMaxLenght - comment.length} caracteres restantes</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={handleConfirm} disabled={isLoading} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-green-600 hover:bg-green-700">
            {isLoading ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewModal;