"use client";
import { useState, useEffect, useCallback } from "react";
import ProductTable from "@/components/admin/ProductTable";
import Link from "next/link";
import { Plus, Package, ArrowRight } from "lucide-react";
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

  const activeCount = products.filter((p) => p.active).length;
  const draftCount = products.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Products</h1>
          <p className="font-body text-sm text-muted mt-1">
            {loading
              ? "Loading..."
              : products.length === 0
              ? "No products yet"
              : `${products.length} product${products.length !== 1 ? "s" : ""} · ${activeCount} published${draftCount > 0 ? ` · ${draftCount} draft` : ""}`}
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
      ) : products.length === 0 ? (
        <div className="border border-border p-12 text-center space-y-4">
          <Package size={40} className="mx-auto text-muted" />
          <div className="space-y-1">
            <p className="font-display text-xl text-foreground">Add your first product</p>
            <p className="font-body text-sm text-muted max-w-sm mx-auto">
              Upload photos, set a price, and write a description. You can save as a draft and
              publish whenever you&apos;re ready.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-foreground text-background font-accent text-xs tracking-wider uppercase px-5 py-3 hover:bg-primary transition-colors"
          >
            <Plus size={14} />
            Add your first product
          </Link>
          <p className="text-xs text-muted">
            Need help?{" "}
            <Link href="/admin/settings" className="text-primary hover:underline">
              Configure your store settings <ArrowRight size={10} className="inline" />
            </Link>
          </p>
        </div>
      ) : (
        <ProductTable products={products} onRefresh={fetchProducts} />
      )}
    </div>
  );
}
