import { ReviewType } from "@/lib/types/api";
import Image from "next/image";
import Link from "next/link";
import StarRatingDisplay from "./starRatingDisplay";
// import StarRatingDisplay

interface ReviewCardProps {
  review: ReviewType;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const author = review.sale.buyer;
  const listing = review.sale.listing;

  if (!author || !listing) {
    return <p className="p-4 text-sm text-red-500">Dados da avaliação incompletos</p>
  }

  const avatarImageSrc = author.photo_url ?? '/user_placeholder.png'

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-start">
        <div className="relative h-10 w-10 rounded-full overflow-hidden">
          <Image
            src={avatarImageSrc}
            alt={`Foto de ${author.display_name}`}
            fill
            className="object-cover w-full h-full"
          />                         
        </div>                          
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <Link href={`/usuario/${author.slug}`} className="font-medium text-gray-800">{author.display_name}</Link>
          <span className="text-sm text-gray-500">{new Date(review.sale.sold_at).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="mt-1">
          <StarRatingDisplay rating={review.rating}/>
        </div>
        <p className="mt-2 text-gray-700">{review.comment}</p>
      </div>
      </div>
    </div> 
  );
}

export default ReviewCard;