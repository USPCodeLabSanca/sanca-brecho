import Link from "next/link";

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
        <Link href="/">
          <button className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca/90">
            🏠 Voltar para a página inicial
          </button>
        </Link>
      </div>
    </main>
  </div>
  );
}