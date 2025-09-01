"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ProductCard from "@/app/components/productCard";
import { FaWhatsapp } from 'react-icons/fa';
import {
  MapPin,
  Calendar,
  Package,
  Settings,
  Edit,
  BadgeCheck,
  ShieldCheck,
  Handshake,
  ShoppingBag,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { useEffect, useState } from "react";
import { ProfileType, ListingType, ProfileMetricsType } from "@/lib/types/api";
import { useAuth } from "@/lib/context/AuthContext";
import { PurchasedProductCard } from "@/app/components/purchasedProductCard";
import { SoldProductCard } from "@/app/components/soldProductCard";
import { getProfileBySlug, getProfileMetricsBySlug } from "@/lib/services/profileService";
import { getMe } from "@/lib/services/userService";
import { getListingsByUser } from "@/lib/services/listingService";
import { showErrorToast } from "@/lib/toast";
import Spinner from "@/app/components/spinner";
import { ReportDialog } from "@/app/components/reportModal";

const Usuario = () => {
  const { slug } = useParams<{ slug: string }>();

  const { user: currentUserFirebase, loading: loadingAuth } = useAuth();

  const [userProfile, setUserProfile] = useState<ProfileType | undefined>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<ProfileMetricsType | undefined>(undefined);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [errorMetrics, setErrorMetrics] = useState<string | null>(null);

  const [userProducts, setUserProducts] = useState<ListingType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  // Mocks
  const [soldProducts, setSoldProducts] = useState<
    (ListingType & { soldTo: { id: string, display_name: string, slug: string, photo_url?: string }, buyerReview?: { rating: number, comment?: string, reviewed_at: string } })[]
  >([
    {
      id: "123e4567-e89b-12d3-a456-426614174000" as any,
      title: "Cadeira de Escritório Ergonômica",
      description: "Cadeira semi-nova, super confortável.",
      price: 450.00,
      condition: "used",
      is_negotiable: true,
      seller_can_deliver: true,
      location: "São Carlos, SP",
      category_id: 1,
      category: { id: 1, name: "Móveis", icon: "🪑", parent_id: null, parent: null, children: [] },
      user_id: "user-seller-1",
      created_at: new Date("2023-01-10T10:00:00Z"),
      updated_at: new Date("2023-01-15T11:00:00Z"),
      is_active: false,
      slug: "cadeira-escritorio-ergonomica",
      user: {
        id: "user-seller-1",
        display_name: "Ana Vendedora",
        email: "ana@email.com",
        photo_url: "https://i.pravatar.cc/150?u=ana",
        whatsapp: "16999999999",
        telegram: null,
        university: "USP São Carlos",
        verified: true,
        created_at: new Date("2022-01-01T00:00:00Z"),
        updated_at: new Date("2022-01-01T00:00:00Z"),
        slug: "ana-vendedora",
        role: "user"
      },
      soldTo: {
        id: "user-buyer-1",
        display_name: "Carlos Comprador",
        slug: "carlos-comprador",
        photo_url: "https://i.pravatar.cc/150?u=carlos"
      },
      buyerReview: {
        rating: 5,
        comment: "Excelente vendedor e produto, super recomendo!",
        reviewed_at: "2023-01-20T14:30:00Z"
      }
    }
  ]);

  const [purchasedProducts, setPurchasedProducts] = useState<
    (ListingType & { buyerReview?: { rating: number, comment?: string, reviewed_at: string } })[]
  >([
    {
      id: "123e4567-e89b-12d3-a456-426614174001" as any,
      title: "Tablet Samsung Galaxy Tab S7",
      description: "Tablet em excelente estado, usado por 6 meses.",
      price: 1800.00,
      condition: "used",
      is_negotiable: true,
      seller_can_deliver: true,
      location: "São Carlos, SP",
      category_id: 2,
      category: { id: 2, name: "Eletrônicos", icon: "💻", parent_id: null, parent: null, children: [] },
      user_id: "user-seller-2",
      created_at: new Date("2023-03-01T15:00:00Z"),
      updated_at: new Date("2023-03-05T16:00:00Z"),
      is_active: false,
      slug: "tablet-samsung-galaxy-tab-s7",
      user: {
        id: "user-seller-2",
        display_name: "Pedro Vendedor",
        email: "pedro@email.com",
        photo_url: "https://i.pravatar.cc/150?u=pedro",
        whatsapp: "16988888888",
        telegram: "pedrovendedor",
        university: "UFSCar",
        verified: true,
        created_at: new Date("2022-02-01T00:00:00Z"),
        updated_at: new Date("2022-02-01T00:00:00Z"),
        slug: "pedro-vendedor",
        role: "user"
      },
      buyerReview: undefined
    }
  ]);
  // Fim dos Mocks

  const [isOwnerProfile, setIsOwnerProfile] = useState<boolean | undefined>(undefined);
  const [loadingOwnership, setLoadingOwnership] = useState(true);
  const [errorOwnership, setErrorOwnership] = useState<string | null>(null);

  // Busca o usuário pela slug
  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) {
        setLoadingProfile(false);
        setErrorProfile("Slug do usuário não fornecido.");
        return;
      }
      try {
        const data = await getProfileBySlug(slug);
        setUserProfile(data);
      } catch (error: any) {
        setUserProfile(undefined);
        setErrorProfile(error.message);
        console.error("Falha ao buscar perfil:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [slug]);

  // Busca as métricas do usuário atual
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!slug) {
        setLoadingMetrics(false);
        return;
      }
      try {
        const data = await getProfileMetricsBySlug(slug);
        setMetrics(data);
      } catch (error: any) {
        setMetrics(undefined);
        setErrorMetrics(error.message);
        console.error("Falha ao buscar métricas:", error);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, [slug]);

  // Verifica se o usuário atual é o dono do perfil
  useEffect(() => {
    const checkOwnership = async () => {
      if (!slug || !currentUserFirebase) {
        setLoadingOwnership(false);
        setIsOwnerProfile(false);
        return;
      }
      try {
        const data = await getMe();
        if (data.slug !== slug) {
          setIsOwnerProfile(false);
          return;
        }
        setIsOwnerProfile(true);
      } catch (error: any) {
        setErrorOwnership(error.message);
        console.error("Falha ao verificar propriedade:", error);
        setIsOwnerProfile(false);
      } finally {
        setLoadingOwnership(false);
      }
    };

    if (!loadingProfile && currentUserFirebase) {
      checkOwnership();
    } else if (!loadingAuth && !currentUserFirebase) {
      setLoadingOwnership(false);
      setIsOwnerProfile(false);
    }
  }, [slug, currentUserFirebase, loadingProfile, loadingAuth]);

  // Busca os produtos do usuário encontrado
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!userProfile?.slug) {
        setLoadingProducts(false);
        return;
      }
      try {
        const data = await getListingsByUser(userProfile.slug);
        setUserProducts(data);
      } catch (error: any) {
        setUserProducts([]);
        setErrorProducts(error.message);
        showErrorToast("Erro ao buscar produtos do usuário.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchUserProducts();
  }, [userProfile?.slug]);
  
  useEffect(() => {
    if (isOwnerProfile) {
      // TODO: Implementar
      // fetchSoldProducts();
      // fetchPurchasedProducts();
    }
  }, [isOwnerProfile]);


  if (loadingProfile || loadingProducts || loadingAuth || loadingOwnership) {
    return <Spinner />;
  }

  if (!userProfile || (userProfile && !userProfile.role)) {
    return notFound();
  }

  if (errorProfile || errorProducts || errorOwnership) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-500">
        <p>Erro ao carregar a página do usuário:</p>
        <p>{errorProfile || errorProducts || errorOwnership}</p>
      </div>
    );
  }

  const userAvatar = userProfile.photo_url || 'https://sancabrechobucket.s3.us-east-2.amazonaws.com/Portrait_Placeholder.png';

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {isOwnerProfile && !userProfile.verified && (
              <div className="mb-6 rounded-lg bg-sanca/10 p-4 text-center">
                <div className="flex justify-center mb-2">
                  <ShieldCheck className="h-8 w-8 text-sanca" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Complete seu perfil para anunciar!</h3>
                <p className="mt-1 mb-4 text-sm text-gray-600">
                  A verificação do seu telefone aumenta a confiança e a segurança para todos na plataforma.
                </p>
                <Link href="/onboarding">
                  <button className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white h-10 px-4 py-2 w-full sm:w-auto bg-sanca hover:bg-sanca/90 transition-colors">
                    Completar Cadastro
                  </button>
                </Link>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="h-32 bg-gradient-to-r from-sanca to-[#0ea5e9]"></div>
              <div className="px-6 py-4 relative">
                <div className="absolute -top-12 left-6 border-4 border-white rounded-full overflow-hidden bg-white">
                  <img src={userAvatar} alt={`Foto de perfil de ${userProfile.display_name}`} className="h-24 w-24 object-cover" />
                </div>
                <div className="pt-14 pb-2 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="w-full">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                      {userProfile.display_name}
                      {userProfile.verified && (
                        <div className="relative group">
                          <BadgeCheck className="text-sanca pl-1.5 h-8 w-8" />
                          <div className="absolute w-32 text-center bottom-full mb-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs text-white bg-black px-2 py-1 rounded-md">
                            Usuário verificado
                          </div>
                        </div>
                      )}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 pb-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        {userProfile.university}
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        Membro desde {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Handshake size={16} className="mr-1" />
                        Produtos vendidos: {metrics?.items_sold || 0}
                      </div>
                      <div className="flex items-center">
                        <ShoppingBag size={16} className="mr-1" />
                        Anúncios ativos: {metrics?.active_listings_count || 0}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                      {isOwnerProfile ? (
                        <>
                          <Link href={`/usuario/${slug}/editar`}>
                            <button className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap border border-gray-300 rounded-md text-sm text-black font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-white hover:bg-sanca/10">
                              <Edit className="mr-1 h-4 w-4" />Editar Perfil
                            </button>
                          </Link>
                          {userProfile.role === 'admin' && (
                            <Link href="/admin">
                              <button className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca/90">
                                <Settings className="mr-1 h-4 w-4" />Admin
                              </button>
                            </Link>
                          )}
                        </>
                      ) : ( 
                        <div className="w-full flex items-center justify-between">
                        {userProfile.verified && (
                          
                            <Link href={`https://wa.me/${userProfile.whatsapp}?text=Olá! Vi seu perfil no Sanca Brechó e gostaria de entrar em contato.`}>
                              <button className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-[#25D366] hover:bg-[#25D366]/90">
                                <FaWhatsapp className="text-white" />Entrar em contato
                              </button>
                            </Link>
                        )}
                            <span/>
                            <ReportDialog targetId={userProfile.slug} targetType="user" />
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Tabs>
              <TabList className="grid bg-slate-100 rounded-sm p-1" style={{gridTemplateColumns: isOwnerProfile ? 'repeat(3, 1fr)' : '1fr'}}>
                <Tab selectedClassName="bg-white rounded-sm shadow-xs" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none"><Package className="h-4 w-4 mr-2" /><span>
                  {isOwnerProfile ? 'Meus Produtos' : 'Produtos'}
                </span></Tab>
                {isOwnerProfile && (
                  <>
                    <Tab selectedClassName="bg-white rounded-sm shadow-xs" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none"><ShoppingCart className="h-4 w-4 mr-2" /><span>Minhas Compras</span></Tab>
                    <Tab selectedClassName="bg-white rounded-sm shadow-xs" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none"><DollarSign className="h-4 w-4 mr-2" /><span>Minhas Vendas</span></Tab>
                  </>
                )}
              </TabList>
              <TabPanel>
                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Produtos Anunciados ({userProducts.length})</h2>
                  {userProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userProducts.map((product) => (
                        <ProductCard product={product} key={product.id} />))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                      <Package className="h-12 w-12 mx-auto text-gray-300" />
                      <p className="mt-2 mb-6 text-gray-500">Nenhum produto anunciado</p>
                      {isOwnerProfile && (
                        <Link href="/anunciar">
                          <button className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-48 bg-sanca hover:bg-sanca/90">
                            Anunciar Produto
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </TabPanel>
              {isOwnerProfile && (
                <>
                  <TabPanel>
                    <div className="bg-white rounded-xl p-6">
                      <h2 className="text-lg font-semibold mb-4">Minhas Compras ({purchasedProducts.length})</h2>
                      {purchasedProducts.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {purchasedProducts.map((product) => (
                            <PurchasedProductCard
                              product={product}
                              buyerReview={product.buyerReview}
                              key={product.id}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-lg">
                          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300" />
                          <p className="mt-2 text-gray-500">Você ainda não comprou nada.</p>
                        </div>
                      )}
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div className="bg-white rounded-xl p-6">
                      <h2 className="text-lg font-semibold mb-4">Minhas Vendas ({soldProducts.length})</h2>
                      {soldProducts.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {soldProducts.map((product) => (
                            <SoldProductCard
                              product={product}
                              soldTo={product.soldTo}
                              buyerReview={product.buyerReview}
                              key={product.id}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-lg">
                          <DollarSign className="h-12 w-12 mx-auto text-gray-300" />
                          <p className="mt-2 text-gray-500">Você ainda não vendeu nada.</p>
                        </div>
                      )}
                    </div>
                  </TabPanel>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Usuario;