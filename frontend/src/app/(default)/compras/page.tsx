"use client";

import SalesList from "@/app/components/salesList";
import Spinner from "@/app/components/spinner";
import { useAuth } from "@/lib/context/AuthContext";
import { getSalesAsBuyer } from "@/lib/services/saleService";
import { showErrorToast } from "@/lib/toast";
import { SaleType } from "@/lib/types/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Compras() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [sales, setSales] = useState<SaleType[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [errorSales, setErrorSales] = useState<string | null>(null);

  // Verifica atenticação
  useEffect(() => {
    if (loading) return;

    if (!user) {
      showErrorToast("Você precisa estar logado para acessar suas compras");
      router.push("/login");
    }
  }, [loading, user, router]);

  // Busca as compras do usuário
  useEffect(() => {
    const fetchSales = async () => {
      setLoadingSales(true);
      try {
        const data = await getSalesAsBuyer();
        setSales(data);
      } catch (error: any) {
        setErrorSales(error.message);
        console.error("Failed to fetch sales:", error);
      } finally {
        setLoadingSales(false);
      }
    }

    if (!loading && user) fetchSales();
  }, [loading, user]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-center text-xl font-bold m-4">Minhas compras</h1>
            <div className="flex flex-col">
              {loadingSales ? (
                <Spinner />
              ) : errorSales ? (
                <p className="text-red-500 text-center">Erro ao carregar as compras: {errorSales}</p>
              ) : (
                <SalesList sales={sales} context="buyer"/>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}