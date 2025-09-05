import React, { useState } from "react";
import { ListingType } from '@/lib/types/api';
import { createSale } from "@/lib/services/listingService";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingType;
  onSuccess: () => void;
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

const CreateSaleModal: React.FC<ModalProps> = ({ isOpen, onClose, listing, onSuccess }) => {
  const [buyerIdentifier, setBuyerIdentifier] = useState('');
  const [finalPrice, setFinalPrice] = useState(listing.price);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly === '') {
      setFinalPrice(0);
      return;
    }

    const numericValue = Number(digitsOnly) / 100;
    setFinalPrice(numericValue);
  }

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');

    const result = await createSale(listing.id, buyerIdentifier, finalPrice);
    setIsLoading(false);

    if ('error' in result) {
      setError(result.error);
      toast.error(error);
    } else {
      toast.success('Anúncio marcado como vendido!');
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between">
            <h1 className="text-lg font-bold">Marcar como vendido</h1>
            <button onClick={onClose} disabled={isLoading} className="cursor-pointer text-sm text-black font-medium disabled:pointer-events-none"><X /></button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-end">
            <div className="flex-grow">
              <label htmlFor="buyer_identifier" className="text-sm font-semibold">Email ou usuário (Opcional)</label>
              <input
                type="text"
                id="buyer_identifier"
                value={buyerIdentifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuyerIdentifier(e.target.value)}
                placeholder="Identificação do comprador"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-shrink-0 w-32">
              <label htmlFor="final_price" className="text-sm font-semibold">Preço final</label>
              <input
                type="text"
                id="final_price"
                value={formatPrice(finalPrice)}
                onChange={handlePriceChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <button onClick={handleConfirm} disabled={isLoading} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca-dark">
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleModal;