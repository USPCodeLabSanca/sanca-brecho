import { notFound } from 'next/navigation';
import ProdutoCliente from './produtoCliente';

export default async function ProdutoPage({ params }: { params: { id: number } }) {
  const url = await params
  const id = url.id

  // TODO: Fetch do produto da API pelo ID
  const product = {
    id,
    title: "Produto Exemplo",
    description: "Descrição do produto exemplo.",
    price: 99.99,
    category: "Categoria",
    condition: "Novo",
    location: "São Carlos, SP",
    createdAt: new Date().toISOString(),
    images: ["https://placehold.co/1280x900/red/white", "https://placehold.co/1280x900/blue/white", "https://placehold.co/1280x900/green/white"],
    userId: 1,
    userName: "João Silva",
    userAvatar: "https://placehold.co/50x50.jpg",
    phone: "+5511999999999",
    views: 100,
  };

  // TODO: Retornar página de erro se não for encontrado
  if (!product) {
    notFound()
  }

  return <ProdutoCliente product={product} />;
}