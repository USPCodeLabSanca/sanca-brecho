import { notFound } from 'next/navigation';
import ProdutoCliente from './produtoCliente';

export default async function ProdutoPage({ params }: { params: { id: number } }) {
  const url = await params
  const id = url.id

  // TODO: Fetch do produto da API pelo ID
  const product = {
    id,
    title: "Macbook Air 2020",
    description: "Macbook Air 2020 com M1.\nUsado, mas em ótimo estado. \nAcompanha carregador e caixa original.",
    price: 3999.99,
    category: "Eletrônicos",
    condition: "Usado",
    location: "São Carlos, SP",
    createdAt: new Date().toISOString(),
    images: ["https://picsum.photos/id/0/1280/900", 
             "https://picsum.photos/id/2/1280/900",
             "https://picsum.photos/id/9/1280/900",
             "https://picsum.photos/id/5/1280/900",
             "https://picsum.photos/id/6/1280/900",
             "https://picsum.photos/id/8/1280/900",
             "https://picsum.photos/id/4/1280/900",
            ],
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