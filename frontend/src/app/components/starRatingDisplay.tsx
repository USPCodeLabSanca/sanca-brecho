import { Star } from "lucide-react";

interface StarRatingDisplayProps {
    rating: number;
    size?: number;
}

const StarRatingDisplay = ({ rating, size = 16}: StarRatingDisplayProps) => {
    return (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={size}
              className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
          ))}
        </div>
    );
};

export default StarRatingDisplay;