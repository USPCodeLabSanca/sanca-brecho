"use client";

import SaleDetails from "@/app/components/saleDetails";
import Spinner from "@/app/components/spinner";
import { useAuth } from "@/lib/context/AuthContext";
import { getSale } from "@/lib/services/saleService";
import { showErrorToast } from "@/lib/toast";
import { ReviewType, SaleType } from "@/lib/types/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetalhesCompra() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [sale, setSale] = useState<SaleType | null>(null);
  const [loadingSale, setLoadingSale] = useState(true);
  const [errorSale, setErrorSale] = useState<string | null>(null);

  // Verifica atenticação
  useEffect(() => {
    if (loading) return;

    if (!user) {
      showErrorToast("Você precisa estar logado para acessar sua compra");
      router.push("/login");
    }
  }, [loading, user, router]);

  // Busca a compra do usuário
  useEffect(() => {
    const fetchSale = async () => {
      setLoadingSale(true);
      try {
        const data = await getSale(id);
        setSale(data);

      } catch (error: any) {
        setErrorSale(error.message);
        console.error("Failed to fetch sales:", error);
      } finally {
        setLoadingSale(false);
      }
    }

    if (!loading && user) fetchSale();
  }, [loading, user, id]);

  const handleReviewSuccess = (newReview: ReviewType) => {
    setSale(currentSale => {
      if (!currentSale) return null;
      return { ...currentSale, review: newReview}
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-center text-xl font-bold m-4">Detalhes da venda</h1>
            <div className="flex flex-col">
              {loadingSale ? (
                <Spinner />
              ) : errorSale ? (
                <p className="text-red-500 text-center">Erro ao carregar detalhes da venda: {errorSale}</p>
              ) : sale ? (
                <SaleDetails sale={sale} context="seller" onReviewSuccess={handleReviewSuccess}/>
              ) : (
                <p className="text-center">Venda não encontrada.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}