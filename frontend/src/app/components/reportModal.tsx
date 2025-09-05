"use client"

import { useState } from "react"
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
} from "@/app/components/dialog"
import { Flag } from "lucide-react"
import { createReport } from "@/lib/services/reportService";
import { showNotificationToast, showErrorToast } from "@/lib/toast"

type ReportDialogProps = {
  targetId: string
  targetType: "product" | "user"
  triggerClassName?: string
}

export function ReportDialog({ targetId, targetType, triggerClassName }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      showErrorToast("Por favor, selecione um motivo.");
      return;
    }
    try {
      setLoading(true);
      await createReport({
        target_id: targetId,
        target_type: targetType,
        reason,
        details,
      });

      showNotificationToast("Denúncia enviada com sucesso!");
      setReason("");
      setDetails("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      showErrorToast("Não foi possível enviar sua denúncia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`cursor-pointer text-gray-500 hover:text-sanca flex items-center text-sm ${triggerClassName ?? ""}`}
        >
          <Flag className="h-4 w-4 mr-1" />
          Denunciar
        </button>
      </DialogTrigger>

      <DialogOverlay className="fixed inset-0 bg-black/50" />

      <DialogContent className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            {targetType === "product" ? "Denunciar produto" : "Denunciar usuário"}
          </DialogTitle>
          <DialogDescription>
            {targetType === "product"
              ? "Nos informe o motivo da denúncia deste anúncio."
              : "Nos informe o motivo da denúncia deste usuário."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <label className="block text-sm font-medium">
            Motivo
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-1 border rounded-md p-2"
            >
              <option value="">Selecione...</option>
              <option value="fraude_golpe">Fraude ou golpe</option>
              <option value="proibido">Produto/usuário proibido</option>
              <option value="info_falsa">Informações falsas</option>
              <option value="outro">Outro</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            Detalhes adicionais
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full mt-1 border rounded-md p-2"
              rows={4}
              placeholder="Descreva o problema..."
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
            disabled={!reason || loading}
            className="px-4 py-2 rounded-md bg-sanca text-white hover:bg-sanca/90 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar denúncia"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}