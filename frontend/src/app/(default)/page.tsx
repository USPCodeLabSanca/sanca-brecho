'use client'

import ProductCard from "../components/productCard";
import Categories from "../components/categories";
import { useState, useEffect } from "react";
import { CategoryType, ListingType } from "@/lib/types/api"
import Pagination from '@mui/material/Pagination';
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css';
import Link from "next/link";
import { getCategories } from "@/lib/services/categoryService";
import { getListings } from "@/lib/services/listingService";

export default function Home() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<ListingType[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error: any) {
        setErrorCategories(error.response?.data?.error || error.message);
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await getListings(page, pageSize);
        setProducts(response.data);
        setTotal(response.total);
      } catch (error: any) {
        setErrorProducts(error.response?.data?.error || error.message);
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [page, pageSize]);

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
          <Link href={"/anunciar"}>
            <button className="inline-flex items-center justify-center gap-2 p-3 text-sm font-medium text-sanca bg-white rounded-md cursor-pointer hover:bg-gray-100">
              Anunciar Produto
            </button>
          </Link>
          <Link href="/categorias" className="visited:text-inherit">
            <button className="inline-flex items-center justify-center gap-2 p-3 text-sm font-medium text-white rounded-md cursor-pointer border border-white hover:bg-black/5">
              Ver Categorias
            </button>
          </Link>
        </div>
      </section>

      <section className="py-6 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center pb-4">
            <h1 className="text-2xl font-bold">Categorias</h1>
            <Link className="flex items-center text-sanca visited:text-sanca" href="/categorias">
              Ver Todas{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCategories ? (
            <p>Carregando categorias...</p>
          ) : errorCategories ? (
            <p className="text-red-500">Erro ao carregar as categorias: {errorCategories}</p>
          ) : (
            <Swiper
              spaceBetween={15}
              slidesPerView={2}
              breakpoints={{
                320: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 6 },
                1280: { slidesPerView: 8 },
              }}
            >
              {categories.map((categoria) => (
                <SwiperSlide key={categoria.id} className="py-2">
                  <Categories name={categoria.name} icon={categoria.icon} id={categoria.id} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      <section className="py-6 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold pb-4 sm:text-left text-center">Produtos Recentes</h1>
          {/* Não implementado 
          <div className="flex flex-col-reverse sm:flex-row sm:items-center items-baseline pb-4 justify-between gap-4">
            <div>
              <div className="flex justify-between p-1 rounded-lg bg-slate-100">
                <button
                  onClick={() => setClicked(1)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer font-medium ${clicked === 1 ? "bg-white text-black shadow-xs" : "bg-slate-100 text-slate-500"}`}
                > Todos </button>
                <button
                  onClick={() => setClicked(2)}
                  className={`px-3 py-1.51 rounded-lg cursor-pointer font-medium ${clicked === 2 ? "bg-white text-black shadow-xs" : "bg-slate-100 text-slate-500"}`}
                > Populares </button>
                <button
                  onClick={() => setClicked(3)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer font-medium ${clicked === 3 ? "bg-white text-black shadow-xs" : "bg-slate-100 text-slate-500"}`}
                > Recentes </button>
              </div>
            </div>

            <div className="flex sm:max-w-80 w-full">
              <div className="relative w-full mr-2">
                <Search className="absolute text-slate-400 left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="flex w-full h-10 px-3 py-2 pl-10 pr-4 text-base md:text-sm rounded-md border border-slate-300 bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanca focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent"
                />
              </div>
              <div>
                <button className="h-10 w-10 flex justify-center items-center bg-white border border-slate-300 rounded-md cursor-pointer hover:bg-gray-200">
                  <Filter className="text-slate-500 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          */}

          {loadingProducts ? (
            <p>Carregando produtos...</p>
          ) : errorProducts ? (
            <p className="text-red-500">Erro ao carregar os produtos: {errorProducts}</p>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                  <div className="max-w-xs" key={product.id}>
                    <ProductCard
                      product={product}
                    />
                  </div>
                ))}
              </div>
              <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={(_, value) => setPage(value)} shape="rounded" className="flex justify-center mt-6" />
            </>
          ) : (
            <div className="text-center sm:text-left">
              <p className="text-slate-600">Nenhum produto encontrado.</p>
            </div>
          )}

          {/* Não implementado 
          <div className="flex justify-center pt-8"> 
            <button className="px-3 py-2 font-medium border-1 border-gray-300 rounded-md cursor-pointer hover:bg-purple-100">
              Carregar mais
            </button>
          </div>
          */}
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
        <Link href="/anunciar" className="visited:text-inherit">
          <button className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-medium text-white bg-sanca rounded-md cursor-pointer hover:opacity-50">
            Anunciar Produto
          </button>
        </Link>
      </section>
    </>
  );
}