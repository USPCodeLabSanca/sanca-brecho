import { Button } from "@/app/components/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
    <main className="flex-grow flex items-center justify-center py-10">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-sanca mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Produto não encontrado</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          O produto que você está procurando não existe.
        </p>
        <Button href="/">
          <Home className="w-4 h-4" /> Voltar para a página inicial
        </Button>
      </div>
    </main>
  </div>
  );
}