import { getListingImages } from "@/lib/services/listingService";
import { ReviewType, SaleType } from "@/lib/types/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "./spinner";
import { ChevronRight, MessageCircle } from "lucide-react";
import CreateReviewModal from "./createReviewModal";
import ReviewPrompt from "./reviewPrompt";
import SafeImage from "./safeImage";

interface SaleDetailsProps {
  sale: SaleType;
  context: 'buyer' | 'seller';
  onReviewSuccess: (newReview: ReviewType) => void;
}

const SaleDetails = ({ sale, context, onReviewSuccess }: SaleDetailsProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('/product_placeholder.png');
  const [loadingImage, setLoadingImage] = useState(true);
  const [errorImage, setErrorImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    };

    if (sale.listing_id) {
      fetchProductImage();
    }
  }, [sale.listing_id]);

  const formattedDate = new Date(sale.sold_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(sale.final_price);

  const otherParty = context === 'buyer' ? sale.seller : sale.buyer;

  const otherPartyProfileSlug = otherParty?.slug;
  const otherPartyAvatarSrc = otherParty?.photo_url || '/user_placeholder.png';

  const handleModalSuccess = (newReview: ReviewType) => {
    onReviewSuccess(newReview);
    setIsModalOpen(false);
  }

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${otherParty?.whatsapp}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div>
      {isModalOpen &&
        <CreateReviewModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sale={sale}
          onSuccess={handleModalSuccess}
        />}

      {context === 'buyer' && (
        <ReviewPrompt 
          sale={sale}
          onEvaluateClick={() => setIsModalOpen(true)}
        />
      )}
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold">Detalhes do produto</h2>
        <Link href={`/produto/${sale.listing.slug}`}
          className="flex justify-between items-center gap-x-6 pb-2 pt-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
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
              <p className="text-sm/6 font-semibold">{sale.listing.title}</p>
              <p className="text-xs/4 text-gray-500">Vendido em {formattedDate}</p>
              <p className="text-xs/6 text-gray-500">Por {formattedPrice}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4"/>
        </Link>
      </div>
      {sale.buyer_id && <>
        <hr className="my-4 border-t border-gray-300" />
        <div>
          <h2 className="font-semibold">Contato com o {context === 'buyer' ? 'vendedor' : 'comprador'}</h2>
          <div className="flex justify-between py-4 gap-4">
            <div className="flex gap-4">
              <button onClick={() => router.push(`/usuario/${otherPartyProfileSlug}`)} className="cursor-pointer">
                <span className="relative flex shrink-0 overflow-hidden rounded-full h-10 w-10">
                  <Image
                    alt="foto de perfil"
                    width={36}
                    height={36}
                    className="aspect-square h-full w-full"
                    src={otherPartyAvatarSrc}
                  />
                </span>
              </button>
              <div className="flex flex-col justify-center">
                <p className="text-sm">{otherParty?.display_name}</p>
                <Link href={`/usuario/${otherPartyProfileSlug}`} className="text-sm text-sanca hover:underline">Ver perfil</Link>
              </div>
            </div>
            <button onClick={handleWhatsAppClick} className="text-sanca cursor-pointer">
              <MessageCircle />
            </button>
          </div>
        </div>
      </>}
    </div>
  );
}

export default SaleDetails;