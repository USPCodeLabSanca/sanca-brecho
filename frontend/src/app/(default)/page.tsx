'use client'

import ProductCard from "../components/productCard";
import Categories from "../components/categories";
import { useState } from "react";
import { ArrowRight, Filter, Search } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css';
import Link from "next/link";

const exemploProduto = {
  location: "São Paulo, SP",
  userName: "Maria Silva",
  userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
  sellerHandlesDelivery: true,
  isNegotiable: true,
  id: "produto-123",
  userId: "user-456",
  title: "Notebook Dell Inspiron 15",
  description: "Notebook em ótimo estado, pouco uso, com carregador.",
  price: 2999.99,
  images: ["https://i.pravatar.cc/150?img=1"],
  createdAt: "2025-05-19T12:00:00Z",
  category: "Eletrônicos",
};

 const exemplosCategorias = [
  {
    name: 'Livros',
    icon: '📚'
  },
  {
    name: 'Eletrônicos',
    icon: '💻'
  },
  {
    name: 'Móveis',
    icon: '🪑'
  },
  {
    name: 'Transporte',
    icon: '🚲'
  },
  {
    name: 'Roupas',
    icon: '👕'
  },
  {
    name: 'Música',
    icon: '🎸'
  },
  {
    name: 'Esportes',
    icon: '⚽'
  },
  {
    name: 'Jogos',
    icon: '🎮'
  },
  ];

export default function Exemplo() {
  const [clicked, setClicked] = useState(1);

  return (
    <>
      <section className="mx-auto px-4 py-20 text-center text-white bg-sanca">
        <h1 className="mb-4 text-3xl md:text-4xl font-bold">
          Compre e venda entre universitários de São Carlos
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg">
          Encontre livros, eletrônicos, móveis e muito mais para facilitar sua
          vida universitária.
        </p>
        <div className="flex flex-row items-center justify-center gap-5 text-lg">
          <Link href={"anunciar"}>
            <button className="inline-flex items-center justify-center gap-2 p-3 text-sm font-medium text-sanca bg-white rounded-md cursor-pointer hover:bg-gray-100">
              Anunciar Produto
            </button>
          </Link>
          <a href="" className="visited:text-inherit">
            <button className="inline-flex items-center justify-center gap-2 p-3 text-sm font-medium text-white rounded-md cursor-pointer border border-white hover:bg-black/5">
              Ver Categorias
            </button>
          </a>
        </div>
      </section>

      <section className="py-6 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center pb-4">
            <h1 className="text-2xl font-bold">Categorias</h1>
            <a className="flex items-center text-sanca visited:text-sanca" href="">
              Ver Todas{" "}
              <ArrowRight className="w-4 h-4"/>
            </a>
          </div>

        <Swiper
          spaceBetween={15}
          slidesPerView={2}
        breakpoints={{
            320: {
            slidesPerView: 3,
            },
            768: {
            slidesPerView: 4,
            },
            1024: {
            slidesPerView: 6,
            },
            1280: {
            slidesPerView: 8,
            },
        }}
        >
          {exemplosCategorias.map((categoria, index) => (
            <SwiperSlide key={index}>
              <Categories name={categoria.name} icon={categoria.icon} />
            </SwiperSlide>
          ))}
        </Swiper>
        </div>
      </section>

      <section className="py-6 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold pb-4 sm:text-left text-center">Produtos Recentes</h1>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center items-baseline pb-4 justify-between gap-4">
            <div>
              <div className="flex justify-between p-1 rounded-lg bg-slate-100">
                <button
                  onClick={() => setClicked(1)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer font-medium ${
                    clicked === 1 ? "bg-white text-black shadow-xs" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setClicked(2)}
                  className={`px-3 py-1.51 rounded-lg cursor-pointer font-medium ${
                    clicked === 2 ? "bg-white text-black shadow-xs" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Populares
                </button>
                <button
                  onClick={() => setClicked(3)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer font-medium ${
                    clicked === 3 ? "bg-white text-black shadow-xs" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Recentes
                </button>
              </div>
            </div>

            <div className="flex sm:max-w-80 w-full">
              <div className="relative w-full mr-2">
                <Search className="absolute text-slate-400 left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="
                    flex w-full h-10 px-3 py-2 pl-10 pr-4
                    text-base md:text-sm rounded-md border border-slate-300 bg-background
                    ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanca focus-visible:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50
                    file:border-0 file:bg-transparent
                  "
                />
              </div>
              <div>
                <button className="h-10 w-10 flex justify-center items-center bg-white border border-slate-300 rounded-md cursor-pointer hover:bg-gray-200">
                  <Filter className="text-slate-500 w-5 h-5"/>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="max-w-xs">
              <ProductCard product={exemploProduto} />
            </div>
            <div className="max-w-xs">
              <ProductCard product={exemploProduto} />
            </div>
            <div className="max-w-xs">
              <ProductCard product={exemploProduto} />
            </div>
            <div className="max-w-xs">
              <ProductCard product={exemploProduto} />
            </div>
            <div className="max-w-xs">
              <ProductCard product={exemploProduto} />
            </div>
            <div className="max-w-xs">
              <ProductCard product={exemploProduto} />
            </div>
            <div className="max-w-xs">
              <ProductCard product={exemploProduto} />
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <button className="px-3 py-2 font-medium border-1 border-gray-300 rounded-md cursor-pointer hover:bg-purple-100">
              Carregar mais
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto px-4 py-14 text-center bg-[#f3eefe]">
        <h1 className="mb-4 text-3xl md:text-3xl font-bold">
          Tem itens que você não usa mais?
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-md text-slate-700">
          Anuncie seus produtos usados no Sanca Brechó e ajude outros
          universitários enquanto ganha um dinheiro extra.
        </p>
        <a href="" className="visited:text-inherit">
        
        
          <button className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-medium text-white bg-sanca rounded-md cursor-pointer hover:opacity-50">
            Anunciar Produto
          </button>
        </a>
      </section>
    </>
  );
}
