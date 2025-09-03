"use client";

import Link from "next/link";
import Image from "next/image";
import { ListingType } from "@/lib/types/api";
import { Star } from "lucide-react";
import { ReviewModal } from "@/app/components/reviewModal";
import { useState, useEffect } from "react";
import { getListingImages } from "@/lib/services/listingService";
import { showErrorToast } from "@/lib/toast";
import Spinner from "./spinner";

// Mock
type UserReview = {
  rating: number;
  comment?: string;
  reviewed_at: string;
};
// Fim do Mock

type PurchasedProductCardProps = {
  product: ListingType;
  buyerReview?: UserReview;
};

export function PurchasedProductCard({ product, buyerReview: initialBuyerReview }: PurchasedProductCardProps) {
  const [buyerReview, setBuyerReview] = useState(initialBuyerReview);
  const [imageSrc, setImageSrc] = useState('https://sancabrechobucket.s3.us-east-2.amazonaws.com/notfound.png');
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchProductImage = async () => {
      setLoadingImage(true);
      try {
        const data = await getListingImages(product.id);
        if (data && data.length > 0 && data[0].src) {
          setImageSrc(data[0].src);
        }
      } catch (error) {
        console.error("Failed to fetch product image:", error);
        showErrorToast('Erro ao carregar a imagem do produto.');
      } finally {
        setLoadingImage(false);
      }
    };

    fetchProductImage();
  }, [product.id]);

  const handleReviewSubmitted = (rating: number, comment: string) => {
    setBuyerReview({ rating, comment, reviewed_at: new Date().toISOString() });
    console.log(`Avaliação enviada para ${product.id}: ${rating} estrelas, "${comment}"`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row w-full">
      {/* Coluna da Imagem */}
      <Link href={`/produto/${product.slug}`} className="block relative h-48 sm:h-auto sm:w-1/3 md:w-1/4 flex-shrink-0 bg-gray-100">
        {loadingImage ? (
          <div className="flex items-center justify-center h-full"><Spinner /></div>
        ) : (
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
      </Link>

      {/* Coluna do Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 leading-tight">
          <Link href={`/produto/${product.slug}`} className="hover:text-sanca">
            {product.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-600 mb-2">Vendido por: <Link href={`/usuario/${product.user.slug}`} className="hover:underline font-medium">{product.user.display_name}</Link></p>
        <p className="text-xl font-bold text-sanca mb-4">
          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>

        <div className="mt-auto border-t border-gray-100 pt-3">
          {buyerReview ? (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Sua avaliação:</p>
              <div className="flex items-center text-yellow-500 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={`mr-1 ${star <= buyerReview.rating ? 'fill-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-1 text-gray-600 text-sm">({buyerReview.rating}/5)</span>
              </div>
              {buyerReview.comment && (
                <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">"{buyerReview.comment}"</p>
              )}
            </div>
          ) : (
            <ReviewModal
              productId={product.id}
              sellerId={product.user_id}
              onReviewSubmitted={handleReviewSubmitted}
              triggerButton={
                <button className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium bg-sanca hover:bg-sanca/90 h-9 px-4">
                  Avaliar Vendedor
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}