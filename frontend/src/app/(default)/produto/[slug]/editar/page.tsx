"use client"

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, FormEvent } from "react";
import { ArrowLeft, Camera, Save, Eye } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { ListingType, CategoryType, ListingImageType } from "@/lib/types/api";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableImage from "@/app/components/draggableImage";
import imageCompression from 'browser-image-compression';
import PriceInput from "@/app/components/priceInput";
import api from "@/lib/api/axiosConfig";
import axios from "axios";

const MAX_SIZE_MB = 5
const MAX_WIDTH_OR_HEIGHT = 1024

type presignedUrl = {
  key: string,
  publicURL: string,
  url: string
}

type previewImage = {
  key: string,
  publicURL: string,
  isNew?: boolean,
  file?: File,
}

export default function EditarProdutoClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<ListingType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category_id: '',
    condition: '',
    is_negotiable: false,
    seller_can_deliver: false,
  });

  const [previewImages, setPreviewImages] = useState<previewImage[]>([]);
  const [originalImages, setOriginalImages] = useState<ListingImageType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProductAndCategories = async () => {
      setIsLoading(true);
      try {
        const productResponse = await api.get(`/listings/slug/${slug}`);
        const productData: ListingType = productResponse.data;
        setProduct(productData);
        setFormData({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category_id: productData.category_id.toString(),
          condition: productData.condition,
          is_negotiable: productData.is_negotiable,
          seller_can_deliver: productData.seller_can_deliver,
        });

        const imagesResponse = await api.get(`/listing-images/listing/${productData.id}`);
        const imagesData: ListingImageType[] = imagesResponse.data;

        setPreviewImages(imagesData.map(img => ({ key: img.id, publicURL: img.src })));
        setOriginalImages(imagesData);
        const categoriesResponse = await api.get('/categories/');
        const categoriesData: CategoryType[] = categoriesResponse.data;
        setCategories(categoriesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndCategories();
  }, [slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    if (isCheckbox) {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);

    try {
      if (previewImages.length > 5) {
        throw new Error('Limite de imagens atingido');
      }

      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > MAX_SIZE_MB) {
        throw new Error(`Arquivo muito grande (${sizeMB.toFixed(1)} MB). Máximo permitido: ${MAX_SIZE_MB} MB.`);
      }

      const response = await api.post('/listing-images/s3', {
        filename: file.name,
        contentType: file.type
      });

      const options = {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      const data: presignedUrl = response.data;
      await axios.put(data.url, compressedFile, {
        headers: {
          'Content-Type': file.type,
        },
      });

      setPreviewImages(prev => [...prev, { publicURL: data.publicURL, key: data.key, isNew: true, file: compressedFile }]);
    } catch (err: any) {
      const message = err.message || 'Erro desconhecido ao enviar';
      alert(message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  const handleImageRemove = (idToRemove: string) => {
    setPreviewImages(prev => prev.filter(img => img.key !== idToRemove));
  };

  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    setPreviewImages((prevImages) => {
      const updatedImages = [...prevImages];
      const [draggedItem] = updatedImages.splice(dragIndex, 1);
      updatedImages.splice(hoverIndex, 0, draggedItem);
      return updatedImages;
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || !user) {
      setError("Não foi possível salvar. Tente novamente.");
      return;
    }
    if (previewImages.length === 0) {
      setError("Você precisa adicionar pelo menos uma imagem.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();

      const listingUpdateResponse = await api.put(`/listings/${product.id}`, {
        ...formData,
        category_id: parseInt(formData.category_id),
        price: Number(formData.price),
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      });

      // Extrai o objeto de listing atualizado da resposta e o novo slug (no caso de atualização de título)
      const updatedListing: ListingType = listingUpdateResponse.data;
      const newSlug = updatedListing.slug;

      const finalImageIds = new Set(previewImages.filter(img => !img.isNew).map(img => img.key));
      const imagesToDelete = originalImages.filter(img => !finalImageIds.has(img.id));
      const imagesToAdd = previewImages.filter(img => img.isNew);
      const imagesToUpdate = previewImages.filter(img => !img.isNew);

      const deletePromises = imagesToDelete.map(img =>
        api.delete(`/listing-images/${img.id}`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        })
      );

      const addPromises = imagesToAdd.map((img) => {
        const order = previewImages.findIndex(i => i.key === img.key);
        return api.post('/listing-images/', {
          listing_id: product.id,
          src: img.publicURL,
          order,
        }, {
          headers: { 'Authorization': `Bearer ${idToken}` },
        });
      });

      const updatePromises = imagesToUpdate.map(img => {
        const newOrder = previewImages.findIndex(i => i.key === img.key);
        const originalImg = originalImages.find(orig => orig.id === img.key);
        if (originalImg && originalImg.order !== newOrder) {
          return api.put(`/listing-images/${img.key}`, {
            order: newOrder,
          }, {
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
        }
        return null;
      });

      await Promise.all([...deletePromises, ...addPromises, ...updatePromises.filter(p => p !== null)]);

      router.push(`/produto/${newSlug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sanca"></div></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">

      {(isUploading || isSubmitting) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-[spin_4s_linear_infinite] border-white"></div>
        </div>
      )}

      <main className="flex-grow pb-10">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <Link href={`/produto/${slug}`} className="text-gray-500 hover:text-sanca flex items-center text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o produto
            </Link>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
              </div>
              <button
                onClick={() => window.open(`/produto/${slug}`, '_blank')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                Visualizar
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm mb-4" role="alert">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DndProvider backend={HTML5Backend}>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Imagens do Produto</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {previewImages.map((image, index) => (
                      <DraggableImage
                        key={image.key}
                        image={{ key: image.key, publicURL: image.publicURL }}
                        index={index}
                        moveImage={moveImage}
                        openViewer={() => { }}
                        removeImage={() => handleImageRemove(image.key)}
                      />
                    ))}

                    {previewImages.length < 5 && (
                      <label htmlFor="image-upload" className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-sanca hover:border-sanca transition-colors cursor-pointer">
                        <Camera className="h-6 w-6 mb-2" />
                        <span className="text-sm">Adicionar</span>
                        <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Máximo de 5 imagens. A primeira imagem será a capa.
                  </p>
                </div>
              </DndProvider>

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Produto *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <PriceInput
                    value={formData.price}
                    onValueChange={(values) => {
                      setFormData(prev => ({ ...prev, price: values ?? 0 }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent"
                  >
                    <option value="" disabled>Selecione</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                    Condição *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent"
                  >
                    <option value="" disabled>Selecione</option>
                    <option value="new">Novo</option>
                    <option value="used">Usado</option>
                    <option value="refurbished">Recondicionado</option>
                    <option value="broken">Com defeito</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_negotiable" checked={formData.is_negotiable} onChange={handleInputChange} className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sanca" />
                    <span className="ml-3 text-sm font-medium">Preço negociável</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="seller_can_deliver" checked={formData.seller_can_deliver} onChange={handleInputChange} className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sanca" />
                    <span className="ml-3 text-sm font-medium">Pode entregar</span>
                  </label>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent resize-vertical"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Link href={`/produto/${slug}`} className="flex-1">
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-sanca text-white rounded-md hover:bg-sanca/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}