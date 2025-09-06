"use client";

import { getListingImages } from "@/lib/services/listingService";
import { SaleType } from "@/lib/types/api";
import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import Spinner from "./spinner";
import { RiUserStarLine } from "react-icons/ri";
import SafeImage from "./safeImage";

interface SaleListItemProps {
  sale: SaleType;
  context: 'buyer' | 'seller';
}

const SaleListItem = ({ sale, context }: SaleListItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('/product_placeholder.png');
  const [loadingImage, setLoadingImage] = useState(true);
  const [errorImage, setErrorImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductImage = async () => {
      setLoadingImage(true);
      setErrorImage(null);
      try {
        const data = await getListingImages(sale.listing_id);
        if (data && Array.isArray(data) && data.length > 0 && data[0].src) {
          setImageSrc(data[0].src);
        } else {
          setImageSrc('/product_placeholder.png');
        }
      } catch (error: any) {
        setErrorImage(error.message);
        setImageSrc('/product_placeholder.png');
        console.error("Erro ao carregar imagem:", error);
      } finally {
        setLoadingImage(false);
      }
    }

    if (sale.listing_id) {
      fetchProductImage();
    }
  }, [sale.listing_id]);

  const formattedDate = new Date(sale.sold_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const routeTarget = context === 'buyer' ? 'compras' : 'vendas';
  return (
    <li
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${routeTarget}/${sale.id}`} className="flex justify-between items-center gap-x-6 py-5">
        <div className="flex min-w-0 gap-x-4">
          <div className="h-24 w-24 flex-shrink-0 relative rounded-md overflow-hidden bg-gray-100">
            {loadingImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner />
              </div>
            ): errorImage ? (
              <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-700 text-center text-xs p-1">
                Erro
              </div>
            ): (
              <SafeImage 
                src={imageSrc}
                alt={sale.listing.title}
                fill
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
              />   
            )}
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <p className="text-xs/6">{formattedDate}</p>
            <p className="text-sm/6 font-semibold">{sale.listing.title}</p>
            {sale.buyer_id && !sale.review ?
              <div className="flex items-center gap-1 text-xs/6 text-yellow-600">
                <RiUserStarLine />
                <p>Pendente avaliação</p>
              </div>
            : <div className="flex items-center gap-1 text-xs/6 text-green-700">
                <Check />
                <p>Compra concluída</p>
              </div>}
          </div>
        </div>
        <ChevronRight className="h-4 w-4"/>
      </Link>
    </li>
  )
}

export default SaleListItem;