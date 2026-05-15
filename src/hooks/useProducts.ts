import { useState, useEffect } from "react";
import { Product } from "@/types";

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const url = category ? `/api/products?category=${encodeURIComponent(category)}` : "/api/products";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  return { products, isLoading, error };
}