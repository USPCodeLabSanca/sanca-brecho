'use client'

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, CheckCircle2, Upload } from "lucide-react";

export default function Anunciar() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3eefe]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-[spin_4s_linear_infinite]  border-sanca"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
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
              <label className="text-sm font-medium block" htmlFor="price">Preço (R$)*</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sanca"
                placeholder="R$ 0,00"
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
                defaultValue="defaultValue"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sanca"
                required
                >
                <option value="defaultValue" disabled>Selecione</option>
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
                defaultValue="defaultValue"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-sanca focus:border-sanca"
                required
                >
                <option value="defaultValue" disabled>Selecione</option>
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

            {/* Imagens */}
            <div className="mb-6">
              <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium">Imagens do produto* (máximo 5)</label>
              <div className='grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4'>
                <div className="aspect-square border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center p-2 w-30 h-30">
                  <Camera className="text-slate-500"/>
                  <label className='text-center' htmlFor="image-upload">
                    <span className="cursor-pointer text-sanca text-sm">Adicionar foto</span>
                    <input id="image-upload" className='hidden' accept="image/*" type="file" required/>
                  </label>
                </div>
              </div>
            </div>

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
      </section>
    </div>
  );
}


