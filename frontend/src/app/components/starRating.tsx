import { Star } from "lucide-react";
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

const StarRating = ({ rating, setRating }: StarRatingProps) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className="focus:outline-none"
            onClick={() => setRating(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            <Star 
              className={`h-8 w-8 cursor-pointer transition-colors ${
                ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill={ratingValue <= (hover || rating) ? 'currentColor' : 'none'}
            />
          </button>
        )
      })}
    </div>
  )
}

export default StarRating;