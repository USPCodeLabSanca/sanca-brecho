"use client"

import Link from "next/link";
import Image from "next/image";
import ProductImageCarousel from "@/app/components/productImageCarousel";
import { notFound, useParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { Edit, MapPin, Share } from "lucide-react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { useEffect, useState } from "react";
import { ListingType } from "@/lib/types/api";
import { useAuth } from "@/lib/context/AuthContext";
import api from "@/lib/api/axiosConfig";

export default function ProdutoClient() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<ListingType>();
  const [errorProduct, setErrorProduct] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const { user, loading: loadingAuth } = useAuth();

  const getDisplayCondition = (condition: string): string => {
    switch (condition) {
      case "new":
        return "Novo";
      case "used":
        return "Usado";
      case "refurbished":
        return "Recondicionado";
      case "broken":
        return "Quebrado";
      default:
        return condition;
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setLoadingProduct(false);
        setErrorProduct("Product slug is missing.");
        return;
      }
      try {
        const response = await api.get(`/listings/slug/${slug}`);
        const data = response.data;
        setProduct(data);
      } catch (error: any) {
        setErrorProduct(error.message);
        console.error("Failed to fetch product:", error);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const isOwner = user && product && user.uid === product.user_id;

  if (loadingProduct || loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sanca"></div>
      </div>
    );
  }

  if (!product || !product.is_active) {
    notFound();
  }

  if (errorProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Erro ao carregar o produto: {errorProduct}
      </div>
    );
  }

  if (!product) return null;

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${product.user.whatsapp}?text=Olá! Vi seu anúncio do produto "${product.title}" no Sanca Brechó e gostaria de mais informações.`;
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
            <ProductImageCarousel productId={product.id} />
            
            {/* Product Info */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                  <p className="text-gray-500">{product.category.name} • {getDisplayCondition(product.condition)}</p>
                </div>
                <div className="flex gap-2">
                  {/*<button
                    onClick={() => {console.log("implementar wishlist");}}
                    className="border-gray-200"
                  >
                    <Heart className="h-5 w-5 text-gray-500 hover:text-sanca" />
                  </button>*/}
                  {isOwner && (
                    <Link href={`/produto/${product.slug}/editar`}>
                      <button className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap border border-gray-300 rounded-md text-sm text-black font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-9 px-3 w-full bg-white hover:bg-sanca/10">
                        <Edit className="h-4 w-4" />Editar
                      </button>
                    </Link>)}
                  <button
                    onClick={handleShare}
                    className="border-gray-200 text-gray-500 hover:text-sanca cursor-pointer"
                  >
                    <Share className="h-5 w-5"/>
                  </button>
                </div>
              </div>
              
              <div className="bg-sanca/5 p-4 rounded-lg mb-6">
                <p className="text-3xl font-bold text-sanca">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="mb-6">
                <button onClick={handleWhatsAppClick} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-green-600 hover:bg-green-700">
                  <FaWhatsapp/>Contatar Vendedor pelo WhatsApp
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <Link href={`/usuario/${product.user.slug}`} className="flex items-center">
                  <Image
                    width={50}
                    height={50}
                    src={product.user.photo_url || 'https://sancabrechobucket.s3.us-east-2.amazonaws.com/Portrait_Placeholder.png'}
                    alt={product.user.display_name}
                    className="rounded-full"
                  ></Image>
                  <div className="ml-2">
                    <p className="font-medium text-gray-800">{product.user.display_name}</p>
                    <p className="text-xs text-gray-500">Vendedor</p>
                  </div>
                </Link>
                
                <Link href={`/usuario/${product.user.slug}`} className="ml-auto">
                  <button className="border border-gray-300 hover:bg-gray-100 h-9 rounded-md px-3 cursor-pointer">
                    Ver perfil
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center gap-3 text-gray-500 text-sm mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.location}
                </div>
                {/* TO-DO: Implementar sistema de visualizações */}
                {/*<div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {product.views} visualizações
                </div>*/}
              </div>
              <Tabs>
                <TabList className="grid grid-cols-2 bg-slate-100 rounded-sm p-1 mb-4">
                  <Tab selectedClassName="bg-white rounded-sm shadow-xs" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none">Descrição</Tab>
                  <Tab selectedClassName="bg-white rounded-sm shadow-xs" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none">Especificações</Tab>
                </TabList>

                <TabPanel>
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                </TabPanel>

                <TabPanel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Categoria</span>
                      <span className="font-medium">{product.category.name}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Condição</span>
                      <span className="font-medium">{getDisplayCondition(product.condition)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Localização</span>
                      <span className="font-medium">{product.location}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Publicado</span>
                      <span className="font-medium">
                        {new Date(product.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Identificador</span>
                      <span className="font-medium">
                        {product.id}
                      </span>
                    </div>
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}