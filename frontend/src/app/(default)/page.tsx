'use client'

import ProductCard from "../components/productCard";
import Categories from "../components/categories";
import { useState, useEffect, useCallback } from "react";
import { CategoryType, ListingType } from "@/lib/types/api"
import Pagination from '@mui/material/Pagination';
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css';
import Link from "next/link";
import { getCategories } from "@/lib/services/categoryService";
import { getListings } from "@/lib/services/listingService";
import { Button } from "../components/button";
import { useRouter, useSearchParams } from 'next/navigation';
import { FriendlyError, getFriendlyError } from "@/lib/errors";
import { CategoriesSkeleton, ProductCardSkeleton } from "../components/skeleton";
import ErrorState from "../components/errorState";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<ListingType[]>([]);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
const [errorCategories, setErrorCategories] = useState<FriendlyError | null>(null);
const [errorProducts, setErrorProducts] = useState<FriendlyError | null>(null);

  const currentPage = Number(searchParams.get('pagina')) || 1; // Assume 1 como padrão

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      setCategories(await getCategories());
    } catch (error) {
      setErrorCategories(getFriendlyError(error));
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const response = await getListings(currentPage, pageSize);
      setProducts(response.data);
      setTotal(response.total);
    } catch (error) {
      setErrorProducts(getFriendlyError(error));
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleHeroSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("search") ?? "");
    router.push(`/categorias?q=${encodeURIComponent(q)}`);
  };

  const tagStyles = ["-rotate-3 mt-6", "rotate-2", "-rotate-1 mt-10"];

  return (
    <>
      <section className="bg-sanca text-white">
        <div className="container mx-auto grid items-center gap-10 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-balance md:text-5xl text-center md:text-left">
              Compre e venda entre universitários de São Carlos
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white text-center md:text-left">
              Encontre livros, eletrônicos, móveis e muito mais para facilitar sua vida universitária.
            </p>

            <form onSubmit={handleHeroSearch} className="mt-8 hidden max-w-xl gap-2 md:flex">
              <input
                name="search"
                placeholder="Procure por livro, bicicleta, mesa de estudo..."
                className="h-12 flex-1 rounded-lg bg-white px-4 text-gray-900 placeholder:text-gray-500 outline-none focus-visible:ring-2 focus-visible:ring-white"
              />
              <button className="h-12 cursor-pointer rounded-lg bg-white px-5 font-semibold text-sanca-dark">
                Buscar
              </button>
            </form>

            <Link href="/anunciar" className="mt-6 inline-block text-sm underline underline-offset-4 text-center md:text-left w-full">
              Tem algo parado em casa? Anuncie aqui
            </Link>
          </div>

          <div className="hidden justify-center gap-4 md:flex">
            {products.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className={`tag-in relative w-40 text-gray-900 ${tagStyles[i]}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center pb-4">
            <h1 className="text-2xl font-bold">Categorias</h1>
            <Link className="flex gap-2 items-center text-sanca visited:text-sanca" href="/categorias">
              Ver Todas{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCategories ? (
            <CategoriesSkeleton />
          ) : errorCategories ? (
            <ErrorState error={errorCategories} onRetry={fetchCategories} />
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

      <section className="py-6 px-4 scroll-mt-14" id="products-section">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : errorProducts ? (
            <ErrorState error={errorProducts} onRetry={fetchProducts} />
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
              <Pagination count={Math.ceil(total / pageSize)} page={currentPage} onChange={(_, value) => {
                // Atualiza o URL com a página
                const params = new URLSearchParams(searchParams.toString());
                params.set('pagina', value.toString());
                router.push(`/?${params.toString()}`, { scroll: false });

                document
                  .getElementById("products-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }} shape="rounded" className="flex justify-center mt-6" />
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
        <Button variant="primary" href="/anunciar">
          Anunciar Produto
        </Button>
      </section>
    </>
  );
}