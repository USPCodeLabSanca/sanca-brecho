"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

const DEFAULT_FALLBACK = '/product_placeholder.png';

interface SafeImageProps extends ImageProps {
  fallbackSrc?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, fallbackSrc, ...props }) => {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
  };

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      src={imageError ? (fallbackSrc || DEFAULT_FALLBACK) : src}
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;