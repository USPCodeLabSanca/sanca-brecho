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
  Flag
} from "lucide-react";
import { useEffect, useState } from "react";
import { ProfileType, ListingType, ProfileMetricsType } from "@/lib/types/api";
import { useAuth } from "@/lib/context/AuthContext";
import { getProfileBySlug, getProfileMetricsBySlug } from "@/lib/services/profileService";
import { getMe } from "@/lib/services/userService";
import { getListingsByUser } from "@/lib/services/listingService";
import { showErrorToast } from "@/lib/toast";
import Spinner from "@/app/components/spinner";

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

  const [isOwnerProfile, setIsOwnerProfile] = useState<boolean | undefined>(undefined);
  const [loadingOwnership, setLoadingOwnership] = useState(true);
  const [errorOwnership, setErrorOwnership] = useState<string | null>(null);

  // TO-DO: Falta o "buscando por" e "avaliações", precisa ter o backend e frontend

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

  if (loadingProfile || loadingProducts || loadingAuth || loadingOwnership) {
    return Spinner();
  }

  if (!userProfile || (userProfile && !userProfile.role)) {
    notFound();
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
                            <Link href="#not_implemented" className="text-gray-500 hover:text-sanca flex items-center text-sm">
                              <Flag className="h-4 w-4 mr-1" />
                              Denunciar
                            </Link>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Tabs defaultValue="products">
              <TabList className="grid bg-slate-100 rounded-sm p-1">
                <Tab selectedClassName="bg-white rounded-sm shadow-xs" value="products" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none"><Package className="h-4 w-4 mr-2" /><span>Produtos</span></Tab>
                {/*<Tab selectedClassName="bg-white rounded-sm shadow-xs" value="lookingFor" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none"><Search className="h-4 w-4 mr-2" /><span>Buscando</span></Tab>
              <Tab selectedClassName="bg-white rounded-sm shadow-xs" value="reviews" className="flex items-center justify-center p-1 cursor-pointer focus:outline-none"><Star className="h-4 w-4 mr-2" /><span>Avaliações</span></Tab>
              */}
              </TabList>
              <TabPanel value="products">
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
              {/*
              <TabPanel value="lookingFor">
              <div className="bg-white rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Produtos que Busca ({userLookingFor.length})</h2>
                {isOwnProfile && (
                  <Link href="/buscar-produto">
                    <button className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca/90">
                      <Plus className="h-4 w-4" />Adicionar
                    </button>
                  </Link>
                )}
                </div>
                {userLookingFor.length > 0 ? (
                <div className="space-y-4">
                  {userLookingFor.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Categoria: {item.category}</span>
                    {!isOwnProfile ? (
                      <button className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-48 bg-[#25D366] hover:bg-[#25D366]/90">
                        <FaWhatsapp className="text-white" />Entrar em contato
                      </button>
                    ) : (
                      <button className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-24 bg-sanca hover:bg-sanca/90">
                        <Trash2 className="h-4 w-4" />Excluir
                      </button>
                    )}
                    </div>
                  </div>
                  ))}
                </div>
                ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Search className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2 text-gray-500">Nenhum produto na lista de buscas</p>
                  {isOwnProfile && (
                  <Link href="/buscar-produto">
                    <button className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca/90">
                      Adicionar produto buscado
                    </button>
                  </Link>
                  )}
                </div>
                )}
              </div>
              </TabPanel>
              <TabPanel value="reviews">
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Avaliações Recebidas</h2>
                {userReviews.length > 0 ? (
                <div className="space-y-4">
                  {userReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                    <img src={review.userAvatar} alt={`Foto de ${review.userName}`} className="h-10 w-10 rounded-full object-cover" />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                      <Link href={`/usuario/${review.reviewerId}`} className="font-medium text-gray-800">{review.userName}</Link>
                      <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                      </div>
                      <p className="mt-2 text-gray-700">{review.comment}</p>
                    </div>
                    </div>
                  </div>
                  ))}
                </div>
                ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Star className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2 text-gray-500">Nenhuma avaliação recebida</p>
                </div>
                )}
              </div>
              </TabPanel>
              */}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Usuario;