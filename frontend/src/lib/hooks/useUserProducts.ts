import { useState, useEffect } from 'react';
import { getListingsByUser } from '../services/listingService';
import { showErrorToast } from '../toast';
import { ListingType } from '../types/api';

export const useUserProducts = (slug: string | undefined, limit?: number, excludeId?: string) => {
  const [products, setProducts] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getListingsByUser(slug, limit, excludeId);
        setProducts(data);
        setError(null);
      } catch (err: any) {
        setProducts([]);
        setError(err.message);
        showErrorToast("Erro ao buscar produtos do usuário.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, [slug, limit, excludeId]);

  return { products, loading, error };
};