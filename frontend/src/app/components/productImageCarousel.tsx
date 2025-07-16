'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Pagination } from 'swiper/modules'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ArrowLeft } from 'lucide-react'
import { ListingImageType } from '@/lib/types/api'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'
import api from '@/lib/api/axiosConfig'
import { getListingImages } from '@/lib/services/listingService'
import { showErrorToast } from '@/lib/toast'

type ProductImageCarouselProps = {
  productId: string; // ID do produto para buscar as imagens
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ productId }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const swiperRef = useRef<any>(null)

  const [thumbnailSwiper, setThumbnailSwiper] = useState<any>(null)
  const [windowWidth, setWindowWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomActive, setIsZoomActive] = useState(false)
  const [images, setImages] = useState<ListingImageType[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [errorImages, setErrorImages] = useState<string | null>(null);

  /* Guarda a largura da tela para uso em layouts responsivos */
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* Busca as imagens do produto na API */
  useEffect(() => {
    const fetchImages = async () => {
      setLoadingImages(true);
      setErrorImages(null);
      try {
        const data = await getListingImages(productId)
        setImages(data);
      } catch (error: any) {
        setErrorImages(error.message);
        showErrorToast('Erro ao carregar as imagens do produto.');
      } finally {
        setLoadingImages(false);
      }
    };

    if (productId) {
      fetchImages();
    }
  }, [productId]);

  /* Inicia com uma imagem em tela cheia se houver o parâmetro 'pid' na URL */
  useEffect(() => {
    const pictureId = searchParams.get('pid')
    if (pictureId) {
      const index = parseInt(pictureId, 10)
      if (index >= 0 && index < images.length) {
        setIsZoomActive(true)
        setActiveIndex(index)
      }
    } else {
      setIsZoomActive(false)
    }
  }, [searchParams, images])

  /* Altera a imagem principal do carrossel se houver 'pid' na URL */
  useEffect(() => {
    const pictureId = searchParams.get('pid')
    if (pictureId && swiperRef.current) {
      swiperRef.current.swiper.slideTo(activeIndex, 0)
    }
  }, [activeIndex, searchParams])

  /* Abre a tela cheia da imagem clicada */
  const openViewer = (index: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pid', index.toString())
    router.push(`?${params.toString()}`, { scroll: false })
    setIsZoomActive(true)
  }

  /* Fecha a tela cheia da imagem clicada */
  const closeViewer = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('pid')
    router.replace(`?${params.toString()}`, { scroll: false })
    setIsZoomActive(false)
  }

  return (
    <div className="w-full">
      <div className="relative group">
        <Swiper
          modules={[Navigation, Thumbs, Pagination]}
          thumbs={{ swiper: thumbnailSwiper }}
          spaceBetween={10}
          /* Setas laterais apenas em telas grandes */
          navigation={{
            enabled: windowWidth >= 768,
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          /* Paginação apenas em telas pequenas */
          pagination={{
            enabled: windowWidth < 768,
            dynamicBullets: true,
          }}
          className="mainSwiper"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          ref={swiperRef}
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id}>
              <Image
                src={img.src}
                alt={`Foto ${index + 1}`}
                width={1280}
                height={900}
                className="mx-auto object-cover aspect-square md:aspect-[1280/900] w-full h-auto"
                onClick={() => openViewer(index)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-button-prev !hidden md:!block" />
        <div className="swiper-button-next !hidden md:!block" />
      </div>

      {windowWidth >= 768 && (
        <Swiper
          onSwiper={setThumbnailSwiper}
          modules={[Thumbs]}
          watchSlidesProgress
          slidesPerView={windowWidth >= 1024 ? 6 : 4}
          spaceBetween={10}
          className="thumbSwiper mt-4"
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id} className="aspect-square w-full h-auto">
              <Image
                src={img.src}
                alt={`Thumb ${index + 1}`}
                width={150}
                height={150}
                className={`w-full h-full object-cover rounded cursor-pointer border transition-all ${index === activeIndex
                  ? 'border-sanca border-2'
                  : 'border-gray-300 hover:border-2 hover:border-sanca'
                  }`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {activeIndex !== null && isZoomActive && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeViewer}
        >
          <TransformWrapper>
            <button
              className="absolute top-2.5 left-2.5 z-50 text-white bg-black/80 px-3 py-3 rounded-full"
              onClick={closeViewer}
            >
              <ArrowLeft />
            </button>
            <TransformComponent>
              <div className="w-screen h-screen flex items-center justify-center">
                <Image
                  src={images[activeIndex].src}
                  alt={`Foto ${activeIndex + 1}`}
                  width={1280}
                  height={900}
                  className="object-contain max-h-screen max-w-screen !pointer-events-auto"
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      )}
    </div>
  )
}

export default ProductImageCarousel