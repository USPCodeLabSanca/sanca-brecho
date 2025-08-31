import React, { useState } from "react";
import { ListingType } from '@/lib/types/api';
import { markListingAsSold } from "@/lib/services/listingService";
import toast from "react-hot-toast";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: ListingType;
    onSuccess: () => void;
}

const MarkAsSoldModal: React.FC<ModalProps> = ({ isOpen, onClose, listing, onSuccess }) => {
    const [buyerIdentifier, setBuyerIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        setError('');

        const result = await markListingAsSold(listing.id, buyerIdentifier);
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
            <div className="flex flex-col gap-2 bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h1 className="text-lg font-bold">Marcar como vendido</h1>
                <input
                    type="text"
                    id="buyer"
                    value={buyerIdentifier}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuyerIdentifier(e.target.value)}
                    placeholder="E-mail ou nome de usuário do comprador"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} disabled={isLoading} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap border border-gray-300 rounded-md text-sm text-black font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-white hover:bg-sanca/10">Cancelar</button>
                    <button onClick={handleConfirm} disabled={isLoading} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-green-600 hover:bg-green-700">
                        {isLoading ? 'Confirmando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarkAsSoldModal;