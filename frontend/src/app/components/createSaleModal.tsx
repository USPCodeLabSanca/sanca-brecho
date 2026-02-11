import React, { useState, useEffect } from "react";
import { ListingType, UserType } from '@/lib/types/api';
import { createSale } from "@/lib/services/listingService";
import { getMe } from "@/lib/services/userService";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "./button";

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
  const { user } = useAuth();
  const [buyerIdentifier, setBuyerIdentifier] = useState('');
  const [finalPrice, setFinalPrice] = useState(listing.price);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    // Busca os dados do usuário logado quando o modal é aberto
    if (isOpen && user) {
      const fetchCurrentUser = async () => {
        try {
          const userData = await getMe();
          setCurrentUser(userData);
        } catch (err) {
          console.error("Falha ao buscar dados do usuário logado:", err);
        }
      };
      fetchCurrentUser();
    }
  }, [isOpen, user]);

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
    // Impedir que o usuário marque um item como vendido para si mesmo
    if (currentUser && buyerIdentifier.trim()) {
      const identifier = buyerIdentifier.trim().toLowerCase();
      if (identifier === currentUser.slug.toLowerCase() || identifier === currentUser.email.toLowerCase()) {
        const selfSaleError = "Você não pode marcar um item como vendido para si mesmo.";
        toast.error(selfSaleError);
        return;
      }
    }

    setIsLoading(true);

    const result = await createSale(listing.id, buyerIdentifier, finalPrice);
    setIsLoading(false);

    if ('error' in result) {
      // Mensagem de erro quando o comprador não é encontrado
      if (result.error.includes("Failed to retrieve Buyer")) {
        const buyerNotFoundError = "Usuário comprador não encontrado. Verifique o email ou slug.";
        toast.error(buyerNotFoundError);
      } else { // Fallback para outras mensagens de erro
        toast.error(result.error);
      }
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
            <Button onClick={onClose} disabled={isLoading} variant="icon"><X /></Button>
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
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleModal;