"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/app/components/dialog";
import { LogIn } from "lucide-react";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginPromptModal = ({ isOpen, onClose }: LoginPromptModalProps) => {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Acesso Restrito</DialogTitle>
          <DialogDescription>
            Você precisa estar logado para ver as informações de contato do vendedor.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 mt-2">
          <DialogClose asChild>
            <button
              type="button"
              className="border border-gray-300 hover:bg-gray-100 h-9 rounded-md px-3 cursor-pointer"
            >
              Cancelar
            </button>
          </DialogClose>

          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-sanca text-white text-sm font-medium hover:bg-sanca/90 cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            Fazer Login
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptModal;