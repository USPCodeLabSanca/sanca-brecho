"use client"

import Link from "next/link";
import Image from "next/image";
import ProductImageCarousel from "@/app/components/productImageCarousel";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowLeft, Calendar, Edit, Handshake, MapPin, Share, Tag, TrendingDown, Truck } from "lucide-react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { useEffect, useState } from "react";
import { ListingType, ProfileMetricsType } from "@/lib/types/api";
import { useAuth } from "@/lib/context/AuthContext";
import { showErrorToast, showNotificationToast } from "@/lib/toast";
import { getProfileMetricsBySlug, getProfileContact } from "@/lib/services/profileService";
import { ReportDialog } from "@/app/components/reportModal";
import CreateSaleModal from "@/app/components/createSaleModal";
import LoginPromptModal from "@/app/components/loginPromptModal";
import { Button } from "@/app/components/button";
import { useSearchParams } from "next/navigation";

interface ProductClientProps {
  initialProduct: ListingType;
}

export default function ProductClient({ initialProduct }: ProductClientProps) {
  const [product, setProduct] = useState<ListingType | null>(initialProduct);
  const [isContactLoading, setIsContactLoading] = useState(false);
  
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProfileMetricsType | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const searchParams = useSearchParams();

  const ref = searchParams?.get("ref");
  const backUrl = ref ? decodeURIComponent(ref) : "/?page=1";

  const getDisplayCondition = (condition: string): string => {
    switch (condition) {
      case "new": return "Novo";
      case "used": return "Usado";
      case "refurbished": return "Recondicionado";
      case "broken": return "Quebrado";
      default: return condition;
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!product?.user.slug) return;
      try {
        const data = await getProfileMetricsBySlug(product.user.slug);
        setMetrics(data);
      } catch (error) {
        console.error("Falha ao buscar métricas:", error);
      }
    };
    fetchMetrics();
  }, [product?.user.slug]);

  const isOwner = user && product && user.uid === product.user_id;

  if (!product) return null;

  const isSold = product.status === 'sold';
  const isAvailable = product.status === 'available';

  const handleSaleSuccess = () => {
    setProduct(currentProduct => {
      if (!currentProduct) return null;
      return { ...currentProduct, status: 'sold' }
    })
    setIsModalOpen(false);
  }

  const handleWhatsAppClick = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsContactLoading(true);
    try {
      const contactInfo = await getProfileContact(product.user.slug);
      const whatsappUrl = `https://wa.me/${contactInfo.whatsapp}?text=Olá! Vi seu anúncio do produto "${product.title}" no Sanca Brechó e gostaria de mais informações.`;
      window.open(whatsappUrl, '_blank');
    } catch {
      showErrorToast("Não foi possível carregar o contato. Tente novamente.");
    } finally {
      setIsContactLoading(false);
    }
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
      showNotificationToast("Link copiado para a área de transferência");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isModalOpen &&
        <CreateSaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          listing={product}
          onSuccess={handleSaleSuccess}
        />}
      <LoginPromptModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <main className="flex-grow pb-10">
        <div className="container mx-auto px-4">
          <div className="py-4 flex justify-between items-center">
            <Button href={backUrl} variant="icon">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            {!isOwner && (
              <ReportDialog targetId={product.id} targetType="product" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProductImageCarousel productId={product.id} />

            {/* Product Info */}
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start mb-3">
                <div className="max-w-full md:max-w-4/5">
                  <h1 className="text-2xl font-bold text-gray-900 break-words text-ellipsis">{product.title}</h1>
                  <p className="text-gray-500">{product.category.name} • {getDisplayCondition(product.condition)}</p>
                </div>
                <div className="flex gap-2">
                  {isOwner && !isSold && (
                    <Button
                      variant="outline"
                      href={`/produto/${product.slug}/editar`}
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>)}
                  <Button
                    variant="icon" 
                    onClick={handleShare}
                    aria-label="Compartilhar"
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {product.is_negotiable && (
                  <span className="inline-block bg-green-100/80 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mb-2">
                    <TrendingDown className="inline-block h-3 w-3 mr-1" />
                    Preço negociável
                  </span>
                )}
                {product.seller_can_deliver && (
                  <span className="inline-block bg-sanca/10 text-sanca text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mb-2">
                    <Truck className="inline-block h-3 w-3 mr-1" />
                    Entrega disponível
                  </span>
                )}
              </div>

              <div className="bg-sanca/5 p-4 rounded-lg mb-4">
                <p className="text-3xl font-bold text-sanca">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="mb-4">
                {isOwner && isAvailable ? (
                  <Button
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full"
                  >
                    <Tag className="h-4 w-4" />Marcar como vendido
                  </Button>
                ) : (
                  <Button
                    onClick={handleWhatsAppClick}
                    variant="green"
                    disabled={isSold}
                    className="w-full"
                  >
                    {isAvailable && <FaWhatsapp />}
                    {isSold ? 'Vendido' :
                      (isContactLoading ? 'Carregando...' : (
                        <>Contatar Vendedor pelo WhatsApp</>
                      ))}
                  </Button>
                )}
              </div>

              <div className="flex justify-between gap-3 mb-4">
                <Link href={`/usuario/${product.user.slug}`} className="flex items-center">
                  <Image
                    width={50}
                    height={50}
                    src={product.user.photo_url || '/user_placeholder.png'}
                    alt={product.user.display_name}
                    className="rounded-full"
                  ></Image>
                  <div className="ml-2">
                    <p className="font-medium text-gray-800">{product.user.display_name}</p>
                    <p className="text-xs text-gray-500">Vendedor</p>
                  </div>
                </Link>

                <Button variant="outline" href={`/usuario/${product.user.slug}`}>
                  Ver perfil
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-gray-500 text-sm mb-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Membro desde {new Date(product.user.created_at).toLocaleDateString('pt-BR')}
                </div>
                {metrics &&
                  <div className="flex items-center">
                    <Handshake className="h-4 w-4 mr-1" />
                    Vendas concluídas: {metrics.items_sold}
                  </div>
                }
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.location}
                </div>
              </div>
              <Tabs>
                <TabList className="grid grid-cols-2 bg-slate-100 rounded-sm p-1 mb-4">
                  <Tab selectedClassName="bg-white rounded-sm shadow-xs" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none">Descrição</Tab>
                  <Tab selectedClassName="bg-white rounded-sm shadow-xs" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none">Especificações</Tab>
                </TabList>

                <TabPanel>
                  <p className="text-gray-700 whitespace-pre-line break-words">{product.description}</p>
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