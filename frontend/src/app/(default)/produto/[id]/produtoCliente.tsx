"use client"

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ProdutoProps = {
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    location: string;
    createdAt: string;
    images: string[];
    userId: number;
    userName: string;
    userAvatar: string;
    phone: string;
    views: number;
  };
};

export default function ProdutoClient({ product }: ProdutoProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // TODO: Melhorar o carrossel de imagens (permitir deslizar na imagem e clicar nas thumbnails pra trocar)
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  {/*}
  const handleWishlistClick = () => {
    if (isAuthenticated) {
      toggleWishlist(product.id);
      console.log(wishlist.includes(product.id) 
          ? "Removido dos favoritos" 
          : "Adicionado aos favoritos");
    } else {
      console.log("Faça login para adicionar aos favoritos");
    }
  };*/}

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${product.phone}?text=Olá! Vi seu anúncio do produto "${product.title}" no Sanca Brechó e gostaria de mais informações.`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Confira este produto no Sanca Brechó: ${product.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log("Link copiado para a área de transferência"); // TODO: Implementar um toast melhor
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pb-10">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="py-4">
            <Link href="/" className="text-gray-500 hover:text-sanca flex items-center text-sm">
              {/*<ArrowLeft className="h-4 w-4 mr-1" />*/}
              ← Voltar para produtos
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="relative">
              <div className="overflow-hidden rounded-lg bg-gray-100 mb-4 h-80">
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="absolute inset-y-0 flex items-center justify-between w-full px-2">
                  <button 
                    onClick={prevImage}
                    className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm border-gray-200"
                  >
                    ←
                  </button>
                  <button 
                    onClick={nextImage}
                    className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm border-gray-200"
                  >
                    →
                  </button>
                </div>
              )}
              
              {/* Thumbnail Navigation */}
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.images.map((image, index) => (
                    <button 
                      key={index}
                      className={`w-16 h-16 rounded border-2 overflow-hidden ${
                        index === currentImageIndex 
                          ? 'border-sanca' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                  <p className="text-gray-500">{product.category} • {product.condition}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {console.log("implementar wishlist");}}
                    className="border-gray-200"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={handleShare}
                    className="border-gray-200"
                  >
                    🔗
                  </button>
                </div>
              </div>
              
              <div className="bg-sanca/5 p-4 rounded-lg mb-6">
                <p className="text-3xl font-bold text-sanca">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="mb-6">
                <button onClick={handleWhatsAppClick} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-green-600 hover:bg-green-700">
                  Contatar Vendedor pelo WhatsApp
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <Link href={`/profile/${product.userId}`} className="flex items-center">
                  <Image
                    width={50}
                    height={50}
                    src={product.userAvatar}
                    alt={product.userName}
                    className="rounded-full"
                  ></Image>
                  <div className="ml-2">
                    <p className="font-medium text-gray-800">{product.userName}</p>
                    <p className="text-xs text-gray-500">Vendedor</p>
                  </div>
                </Link>
                
                <Link href={`/profile/${product.userId}`} className="ml-auto">
                  <button className="border border-gray-300 hover:bg-gray-100 h-9 rounded-md px-3">
                    Ver perfil
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center gap-3 text-gray-500 text-sm mb-6">
                <div className="flex items-center">
                  🗺️
                  {product.location}
                </div>
                <div className="flex items-center">
                  👀
                  {product.views} visualizações
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              <div className="border-t border-gray-200 mt-4 mb-4"/>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Categoria</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Condição</span>
                  <span className="font-medium">{product.condition}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Localização</span>
                  <span className="font-medium">{product.location}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Publicado</span>
                  <span className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Identificador</span>
                  <span className="font-medium">
                    {product.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}