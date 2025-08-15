"use client";
import {Search, LayoutGrid} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { getListings } from "@/lib/services/listingService";
import { CategoryType, ListingType } from "@/lib/types/api";
import { getCategories } from "@/lib/services/categoryService";
import ProductCard from "../../components/productCard";
export default function Categorias() {
  const [products, setProducts] = useState<ListingType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get('category');
    if (categoryFromUrl) {
        setSelectedCategoryId(Number.parseInt(categoryFromUrl));
    }
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error: any) {
        setErrorCategories(error.message);
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getListings();
        setProducts(data);
      } catch (error: any) {
        setErrorProducts(error.message);
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategoryId && product.category_id !== selectedCategoryId) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategoryId]);

  return (
    <>
      <section className="mx-auto px-4 py-20 max-w-[1200px]">
        <div className="md:flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">
            Categorias
          </h1>
          <div className={"relative w-full " + "md:max-w-md "}>
            <Search className="absolute right-7 inset-y-0 my-auto w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 pr-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanca focus-visible:ring-offset-2 md:text-sm"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 mt-5">
          {/* Sidebar */}
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">
                Filtrar por categoria
              </h2>
              {loadingCategories ? (
                <p className="text-sm text-slate-500">Carregando...</p>
              ) : errorCategories ? (
                <p className="text-sm text-red-500">{errorCategories}</p>
              ) : (
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategoryId(null)}
                      className={`w-full text-left flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                        selectedCategoryId === null
                          ? "bg-blue-100 text-sanca"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Todas as categorias
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                          selectedCategoryId === category.id
                            ? "bg-purple-100 text-sanca"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {category.icon} {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
          <div className="flex-1">
            {loadingProducts ? (
              <p>Carregando produtos...</p>
            ) : errorProducts ? (
              <p className="text-red-500">
                Erro ao carregar os produtos: {errorProducts}
              </p>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div className="max-w-xs" key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                    <p className="text-slate-600">Nenhum produto encontrado.</p>
                    <p className="text-sm text-slate-500">Tente ajustar sua busca ou filtro.</p>
                </div>
            )}
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
        <Link href="/anunciar" className="visited:text-inherit">
          <button className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-medium text-white bg-sanca rounded-md cursor-pointer hover:opacity-50">
            Anunciar Produto
          </button>
        </Link>
      </section>
    </>
  );
}
