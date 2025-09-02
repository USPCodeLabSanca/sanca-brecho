"use client";

import { SaleType } from "@/lib/types/api";
import SaleListItem from "./saleListItem";
import { PackageOpen } from "lucide-react";

interface SalesListProps {
  sales: SaleType[];
  context: 'buyer' | 'seller';
}

const SalesList = ({ sales, context }: SalesListProps) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma transação encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">
          Quando você { context === "buyer" ? "comprar" : "vender"} um item, ele aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <ul role="list" className="divide-y divide-black/5">
      {sales.map(sale => (
        <SaleListItem key={sale.id} sale={sale} context={context}/>
      ))}
    </ul>
  )
}

export default SalesList;