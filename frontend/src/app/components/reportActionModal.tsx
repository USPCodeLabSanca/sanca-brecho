"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CheckCircle } from "lucide-react";
import { ReportType, ReportStatus } from "@/lib/types/api";
import { updateReportStatus } from "@/lib/services/reportService";
import { Button } from "./button";

export type ReportModalState = {
  report: ReportType;
} | null;

interface ReportActionModalProps {
  modalState: ReportModalState;
  setModalState: (state: ReportModalState) => void;
  refetchReports: () => void;
}

export function ReportActionModal({ modalState, setModalState, refetchReports }: ReportActionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (modalState) {
      setSelectedStatus('resolved');
    }
  }, [modalState]);

  const handleClose = () => setModalState(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalState) return;

    setIsSubmitting(true);
    try {
      await updateReportStatus(String(modalState.report.id), selectedStatus);
      refetchReports();
      handleClose();
    } catch (error) {
      console.error("Erro ao resolver denúncia:", error);
      alert("Ocorreu um erro ao resolver a denúncia.");
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
            Resolver Denúncia
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Selecione uma ação para a denúncia &quot;{modalState.report.reason}&quot; sobre &quot;{modalState.report.target_name}&quot;.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Ação</label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sanca focus:ring-sanca sm:text-sm h-10 px-3"
              >
                <option value="resolved">Marcar como Resolvida</option>
                <option value="rejected">Rejeitar Denúncia</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={handleClose} variant="outline">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="green">
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? "Confirmando..." : "Confirmar Ação"}
              </Button>
            </div>
          </form>
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