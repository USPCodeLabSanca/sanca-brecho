"use client";
import { Search, LayoutGrid, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getListings, searchListings } from "@/lib/services/listingService";
import { getCategories } from "@/lib/services/categoryService";
import { CategoryType, ListingType } from "@/lib/types/api";
import ProductCard from "../../components/productCard";
import { useDebounce } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

export default function Categorias() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ListingType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 1000);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load category & search from URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const searchFromUrl = searchParams.get("q");

    if (categoryFromUrl) {
      setSelectedCategoryId(Number.parseInt(categoryFromUrl));
    }
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  // Update URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }

    if (selectedCategoryId !== null) {
      params.set("category", selectedCategoryId.toString());
    } else {
      params.delete("category");
    }

    router.replace(`?${params.toString()}`);
  }, [debouncedSearch, selectedCategoryId, router, searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error: any) {
        setErrorCategories(error.message);
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
        let data: ListingType[];
        if (debouncedSearch.trim()) {
          data = await searchListings(debouncedSearch);
        } else {
          data = await getListings();
        }
        setProducts(data);
      } catch (error: any) {
        setErrorProducts(error.message);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch]);

  // Category filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategoryId && product.category_id !== selectedCategoryId) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategoryId]);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setIsDropdownOpen(false);
  };

  const selectedCategory = useMemo(() => 
    categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const CategoryListContent = (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="hidden sm:block text-lg font-semibold mb-4 text-slate-700">
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
              onClick={() => handleCategorySelect(null)}
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
                onClick={() => handleCategorySelect(category.id)}
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
  );

  return (
    <section className="mx-auto px-4 py-8 max-w-[1200px]">
      <div className="md:flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">
          Categorias
        </h1>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-7 inset-y-0 my-auto w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 pr-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanca focus-visible:ring-offset-2 md:text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-5">
        <div className="w-full md:w-1/4 lg:w-1/5">
          <div className="sm:hidden relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white p-4 rounded-lg shadow-sm flex justify-between items-center text-left"
            >
              <div>
                <h2 className="text-xs text-slate-500 font-medium">Filtrar por</h2>
                <span className="text-md font-semibold text-slate-800">
                  {selectedCategory ? selectedCategory.name : 'Todas as categorias'}
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 top-full mt-2 w-full border border-slate-200 rounded-lg shadow-lg">
                {CategoryListContent}
              </div>
            )}
          </div>

          <aside className="hidden sm:block">
            {CategoryListContent}
          </aside>
        </div>

        {/* Products */}
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
              <p className="text-sm text-slate-500">
                Tente ajustar sua busca ou filtro.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}