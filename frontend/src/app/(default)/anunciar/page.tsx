'use client'

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Camera, CheckCircle2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { DndProvider } from "react-dnd";
import DraggableImage from "@/app/components/draggableImage";
import { HTML5Backend } from "react-dnd-html5-backend";
import imageCompression from 'browser-image-compression'
import { NumericFormat } from 'react-number-format';

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
}

export default function Anunciar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams()

  // Estados de imagem
  const [previewImages, setPreviewImages] = useState<previewImage[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Formatação de preço
  const [price, setPrice] = useState<string>('0');

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Faz upload da imagem no s3 (chama o backend)
  // TODO: Mudar a chamada da API para axios
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (previewImages.length > 5) {
        throw new Error('Limite de imagens atingido');
      }

      const file = event.target.files && event.target.files[0];
      if (!file) return;

      // Verifica tamanho bruto
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > MAX_SIZE_MB) {
        throw new Error(`Arquivo muito grande (${sizeMB.toFixed(1)} MB). Máximo permitido: ${MAX_SIZE_MB} MB.`);
      }

      // Request do presigned URL
      const response = await fetch("http://localhost:8080/api/listing-images/s3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: file?.name,
          contentType: file?.type
        })
      });

      if (!response.ok) {
        throw new Error(`Falha ao Enviar arquivo (status ${response.status})`);
      }

      // Compressão
      const options = {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      // Upload do objeto para aws
      const data: presignedUrl = await response.json();
      const upload = await fetch(data.url, {
        method: "PUT",
        body: compressedFile,
        headers: {
          "Content-Type": compressedFile.type
        }
      });

      if (upload.ok) {
        console.log("Upload successful");
      } else {
        throw new Error(`Falha no upload ao servidor (status ${upload.status})`);
      }

      setPreviewImages([...previewImages, { publicURL: data.publicURL, key: data.key }]);
    } catch (err: any) {
      // TODO: mostrar toast de erro
      const message = err.message || 'Erro desconhecido ao enviar';
      alert(message);
    } finally {
      event.target.value = '';
    }
  }

  /* Abre a tela cheia da imagem clicada */
  const openViewer = (image: previewImage) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pid', image.key)
    router.push(`?${params.toString()}`, { scroll: false })
    setActiveImage(image.publicURL);
  }

  /* Fecha a tela cheia da imagem clicada */
  const closeViewer = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('pid')
    router.replace(`?${params.toString()}`, { scroll: false })
    setActiveImage(null);
  }

  /* Move a imagem e mudar a ordem */
  const moveImage = useCallback((from: number, to: number) => {
    setPreviewImages((imgs) => {
      const updated = [...imgs];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  /* Remove a imagem */
  const removeImage = useCallback((idx: number) => {
    setPreviewImages((imgs) => imgs.filter((_, i) => i !== idx));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3eefe]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-[spin_4s_linear_infinite]  border-sanca"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:bg-[#f3eefe]">
      <section className="max-w-3xl p-4 mb-5 mx-auto" >
        <h3 className="sm:text-2xl text-xl font-bold text-center sm:mt-5 mb-3">Anunciar um Produto</h3>
        <div className="bg-white sm:rounded-xl sm:shadow-sm sm:p-6">
          <form className="space-y-3">
            {/* Título */}
            <div className="space-y-1">
              <label className="text-sm font-medium block" htmlFor="title">Título do anúncio</label>
              <input
                type="text"
                name="title"
                id="title"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sanca"
                placeholder="Ex: Livro de Cálculo Vol.1 Thomas"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1">
              <label className="text-sm font-medium block" htmlFor="description">Descrição detalhada</label>
              <textarea
                name="description"
                id="description"
                className="w-full border border-gray-300 rounded-md p-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-sanca"
                placeholder="Descreva detalhes importantes sobre o produto, como estado, marca, modelo, etc."
                required
              ></textarea>
            </div>

            {/* Preço */}
            <div className="space-y-1">
              <label htmlFor="price" className="text-sm font-medium block">Preço (R$)*</label>
              <NumericFormat
                id="price"
                name="price"
                thousandSeparator='.'
                decimalSeparator=','
                decimalScale={2}
                fixedDecimalScale={true}
                prefix='R$ '
                allowLeadingZeros={false}
                value={price}
                onValueChange={({ formattedValue }) => setPrice(formattedValue)}
                inputMode="decimal"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sanca"
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Categoria */}
              <div className="space-y-1">
                <label htmlFor="category" className="text-sm font-medium block">Categoria*</label>
                <select
                  id="category"
                  name="category"
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sanca"
                  required
                >
                  <option value="" disabled>Selecione</option>
                  <option value="books">📚 Livros</option>
                  <option value="eletronics">💻 Eletrônicos</option>
                  <option value="furnitures">🪑 Móveis</option>
                  <option value="transport">🚲 Transporte</option>
                  <option value="clothes">👕 Roupas</option>
                  <option value="music">🎸 Música</option>
                  <option value="sports">⚽️ Esportes</option>
                  <option value="games">🎮 Jogos</option>
                </select>
              </div>

              {/* Condição */}
              <div className="space-y-1">
                <label htmlFor="condition" className="text-sm font-medium block">Condição*</label>
                <select
                  name="condition"
                  id="condition"
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-sanca focus:border-sanca"
                  required
                >
                  <option value="" disabled>Selecione</option>
                  <option value="new">Novo</option>
                  <option value="usedLikeANew">Usado - Como novo</option>
                  <option value="usedLikeGood">Usado - Bom estado</option>
                  <option value="usedLikeBad">Usado - Com marcas de uso</option>
                </select>
              </div>

              {/* Preço negociável */}
              <div>
                <label className="inline-flex items-center cursor-pointer mt-2">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sanca" />
                  <span className="ml-3 text-sm font-medium">Preço negociável</span>
                </label>
              </div>

              {/* Posso entregar */}
              <div>
                <label className="inline-flex items-center cursor-pointer sm:mt-2">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sanca" />
                  <span className="ml-3 text-sm font-medium">Posso entregar o produto</span>
                </label>
              </div>
            </div>

            {/* Grid de imagens com DnD */}
            <DndProvider backend={HTML5Backend}>
              {/* Imagens */}
              <div className="mb-6">
                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium">Imagens do produto* (máximo 5)</label>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {previewImages.map((img, idx) => (
                    <DraggableImage
                      key={img.key}
                      image={img}
                      index={idx}
                      moveImage={moveImage}
                      openViewer={openViewer}
                      removeImage={removeImage}
                    />
                  ))}

                  {previewImages.length < 5 && (
                    <div className="aspect-square border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center p-2">
                      <Camera className="text-slate-500" />
                      <label htmlFor="image-upload" className="text-center">
                        <span className="cursor-pointer text-sanca text-sm">Adicionar fotos</span>
                        <input
                          id="image-upload"
                          className="hidden"
                          accept="image/png, image/jpeg, image/jpg"
                          type="file"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </DndProvider>

            <div className="flex items-center space-x-2">
              <Upload className="text-slate-500 w-4 h-4 sm:w-5 sm:h-5" />
              <p className="text-sm text-gray-500">A primeira imagem será a capa do seu anúncio</p>
            </div>

            {/* Publicar Anúncio */}
            <div className="flex flex-col space-y-4">
              <button type="submit" className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-sanca hover:bg-sanca/90">
                Publicar Anúncio
              </button>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="text-green-600 w-7 h-7 sm:w-5 sm:h-5" />
                <p className="text-sm text-gray-500">Seu anúncio estará visível para todos imediatamente após a publicação</p>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-yellow-500 w-8 h-8 sm:w-5 sm:h-5" />
                <p className="text-sm text-gray-500">Lembre-se de que você é responsável pelo contato, negociação e entrega do produto.</p>
              </div>
            </div>

          </form>
        </div>

        {/* Visualizador de imagens fullscreen */}
        {activeImage && (
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
                <div className="h-screen w-screen flex items-center justify-center">
                  <img
                    src={activeImage}
                    alt="Preview"
                    className="object-contain max-h-screen max-w-screen !pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}

      </section>
    </div>
  );
}


