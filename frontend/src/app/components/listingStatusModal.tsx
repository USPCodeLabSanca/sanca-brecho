import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { ListingType } from "@/lib/types/api";
import { useState } from "react";
import { updateListingStatus } from "@/lib/services/listingService";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export type StatusModalState = { listing: ListingType } | null;

interface ListingStatusModalProps {
    modalState: StatusModalState;
    setModalState: (state: StatusModalState) => void;
    refetchListings: () => void;
}

export function ListingStatusModal({ modalState, setModalState, refetchListings }: ListingStatusModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>(modalState?.listing.status || "available");

    if (modalState && selectedStatus !== modalState.listing.status && !loading) {
       console.log("Selected status:", selectedStatus);
    }

    const handleUpdate = async () => {
        if (!modalState) return;
        setLoading(true);
        try {
            await updateListingStatus(modalState.listing.id, selectedStatus);
            showSuccessToast("Status atualizado com sucesso!");
            refetchListings();
            setModalState(null);
        } catch (error) {
            console.error(error);
            showErrorToast("Erro ao atualizar status.");
        } finally {
            setLoading(false);
        }
    };

    if (!modalState) return null;

    return (
        <Dialog open={!!modalState} onOpenChange={() => setModalState(null)}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Alterar Status do Anúncio</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="mb-4 text-sm text-gray-600">
                        Anúncio: <span className="font-semibold">{modalState.listing.title}</span>
                    </p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Novo Status</label>
                    <select
                        title="Opções de status"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="available">Disponível (available)</option>
                        <option value="sold">Vendido (sold)</option>
                        <option value="deleted">Deletado (deleted)</option>
                    </select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setModalState(null)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}