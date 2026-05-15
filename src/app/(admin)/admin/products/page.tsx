"use client";
import { useState, useEffect, useCallback } from "react";
import ProductTable from "@/components/admin/ProductTable";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?active=false");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Products</h1>
          <p className="font-body text-sm text-muted mt-1">
            {loading ? "Loading..." : `${products.length} total products`}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-foreground text-background font-accent text-xs tracking-wider uppercase px-4 py-2.5 hover:bg-primary transition-colors"
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-secondary animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <ProductTable products={products} onRefresh={fetchProducts} />
      )}
    </div>
  );
}
