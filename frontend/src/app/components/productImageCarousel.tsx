'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Pagination } from 'swiper/modules'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { ListingImageType } from '@/lib/types/api'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'
import { getListingImages } from '@/lib/services/listingService'
import { showErrorToast } from '@/lib/toast'
import SafeImage from './safeImage'
import { Button } from './button'

type ProductImageCarouselProps = {
  productId: string; // ID do produto para buscar as imagens
}

const SWIPER_MODULES = [Navigation, Thumbs, Pagination];

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ productId }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const swiperRef = useRef<any>(null)

  const [thumbnailSwiper, setThumbnailSwiper] = useState<any>(null)
  const [windowWidth, setWindowWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomActive, setIsZoomActive] = useState(false)
  const [images, setImages] = useState<ListingImageType[]>([]);
  const [, setLoadingImages] = useState(true);
  const [, setErrorImages] = useState<string | null>(null);

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

  /* Sincroniza o índice ativo do Swiper com o estado local para manter a imagem correta em destaque */
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      if (swiperRef.current.swiper.realIndex !== activeIndex) {
        swiperRef.current.swiper.slideToLoop(activeIndex, 0)
      }
    }
  }, [activeIndex])

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

  const navigateImage = (direction: 'next' | 'prev', e: React.MouseEvent) => {
    e.stopPropagation()
    if (images.length <= 1) return

    let nextIndex = activeIndex
    if (direction === 'next') {
      nextIndex = (activeIndex + 1) % images.length
    } else {
      nextIndex = (activeIndex - 1 + images.length) % images.length
    }
    openViewer(nextIndex)
  }

  return (
    <div className="w-full">
      <div className="relative group select-none">
        <Swiper
          modules={SWIPER_MODULES}
          thumbs={{ swiper: thumbnailSwiper && !thumbnailSwiper.destroyed ? thumbnailSwiper : null }}
          spaceBetween={10}
          loop={images.length > 1}
          navigation={{
            enabled: windowWidth >= 768,
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          pagination={{
            enabled: windowWidth < 768,
            dynamicBullets: true,
          }}
          className="mainSwiper"
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          ref={swiperRef}
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id}>
              <SafeImage
                src={img.src}
                alt={`Foto ${index + 1}`}
                width={1280}
                height={900}
                className="mx-auto object-cover aspect-square md:aspect-[1280/900] w-full h-auto select-none cursor-pointer"
                onClick={() => openViewer(index)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-button-prev !hidden md:!block select-none" />
        <div className="swiper-button-next !hidden md:!block select-none" />
      </div>

      {windowWidth >= 768 && images.length > 1 && (
        <Swiper
          onSwiper={setThumbnailSwiper}
          modules={SWIPER_MODULES}
          watchSlidesProgress
          slidesPerView={windowWidth >= 1024 ? 6 : 4}
          spaceBetween={10}
          className="thumbSwiper mt-4"
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id} className="aspect-square w-full h-auto">
              <SafeImage
                src={img.src}
                alt={`Thumb ${index + 1}`}
                width={150}
                height={150}
                className={`w-full h-full object-cover rounded cursor-pointer border transition-all select-none ${index === activeIndex
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
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none"
          onClick={closeViewer}
        >
          <Button
            variant="icon"
            aria-label="Fechar visualizador"
            className="absolute top-4 left-4 z-[60] !text-white !p-2 !rounded-full hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              closeViewer();
            }}
          >
            <ArrowLeft size={48} />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="icon"
                className="absolute left-4 z-[60] !text-white !p-2 !rounded-full hover:bg-white/10 transition-colors hidden md:block"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                onClick={(e) => navigateImage('prev', e)}
                aria-label="Imagem Anterior"
              >
                <ChevronLeft size={48} />
              </Button>
              <Button
                variant="icon"
                className="absolute right-4 z-[60] !text-white !p-2 !rounded-full hover:bg-white/10 transition-colors"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                onClick={(e) => navigateImage('next', e)}
                aria-label="Próxima Imagem"
              >
                <ChevronRight size={48} />
              </Button>
            </>
          )}

          <TransformWrapper>
            <TransformComponent>
              <div className="w-screen h-screen flex items-center justify-center">
                <Image
                  priority
                  src={images[activeIndex].src}
                  alt={`Foto ${activeIndex + 1}`}
                  width={1280}
                  height={900}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="object-contain max-h-screen max-w-screen !pointer-events-auto select-none cursor-zoom-in"
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