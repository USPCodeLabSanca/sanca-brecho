"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Truck, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { ListingType } from "@/lib/types/api"
import Image from "next/image";
import { getListingImages } from "@/lib/services/listingService";
import { showErrorToast } from "@/lib/toast";
import Spinner from "./spinner";
import SafeImage from "./safeImage";

interface ProductCardProps {
  product: ListingType;
  className?: string;
  showWishlist?: boolean;
}

const HorizontalProductCard = ({ product, className }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('/product_placeholder.png');
  const [loadingImage, setLoadingImage] = useState(true);
  const [errorImage, setErrorImage] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  let refUrl = "/";
  if (pathname.startsWith('/produto/')) {
    // Se já estamos em uma página de produto, repassamos a ref que já existe na URL.
    // Se por acaso alguém acessou o produto direto (sem ref), o fallback é a Home.
    refUrl = searchParams?.get('ref') || '/?page=1';
  } else {
    // Se estamos fora (Home, Perfil do Usuário, etc), guardamos a URL exata atual.
    const currentQuery = searchParams?.toString();
    refUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
  }

  // Codificamos para não quebrar a URL
  const encodedRef = encodeURIComponent(refUrl);

  useEffect(() => {
    const fetchProductImage = async () => {
      setLoadingImage(true);
      setErrorImage(null);
      try {
        const data = await getListingImages(product.id);
        if (data && Array.isArray(data) && data.length > 0 && data[0].src) {
          setImageSrc(data[0].src);
        } else {
          setImageSrc('/product_placeholder.png');
        }
      } catch (error: any) {
        setErrorImage(error.message);
        setImageSrc('/product_placeholder.png');
        showErrorToast('Erro ao carregar a imagem do produto.');
      } finally {
        setLoadingImage(false);
      }
    };

    if (product.id) {
      fetchProductImage();
    }
  }, [product.id]);


  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  return (
    <Link href={`/produto/${product.slug}?ref=${encodedRef}`}>
      <div
        className={`flex flex-col lg:flex-row w-full bg-white rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md relative cursor-pointer ${className || ""
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="aspect-square relative overflow-hidden lg:w-1/3">
          {loadingImage ? (
            Spinner()
          ) : errorImage ? (
            <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-700 text-center p-2">
              Erro ao carregar imagem
            </div>
          ) : (
            <SafeImage
              src={imageSrc}
              alt={product.title}
              width={500}
              height={500}
              className="object-cover w-full h-full transition-transform duration-300"
              style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
            />
          )}
        </div>

        {/* Content */}
        <div className="p-3 lg:w-2/3 text-wrap break-all flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-1 text-xs text-gray-500">
              <Image
                src={product.user.photo_url || '/user_placeholder.png'}
                alt={product.user.display_name}
                className="h-6 w-6 rounded-full mr-1 object-cover"
                width={36}
                height={36}
              />
              <span className="truncate">{product.user.display_name}</span>
            </div>

            <h3 className="text-lg/5 font-medium line-clamp-2">{product.title}</h3>

            <div className="mb-1 flex justify-between">
              <span className="text-sanca font-semibold text-lg">{formattedPrice}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 justify-end">
            {product.is_negotiable && (
              <div className="bg-sanca text-white text-[10px] sm:text-xs font-normal sm:font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                Negociável
              </div>
            )}
            {product.seller_can_deliver && (
              <div className="bg-sanca text-white text-[10px] sm:text-xs font-normal sm:font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                Entrega
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HorizontalProductCard;