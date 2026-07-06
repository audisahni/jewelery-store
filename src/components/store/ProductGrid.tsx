"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/store/ProductCard";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

interface Filters {
  categories: string[];
  materials: string[];
  priceMin: string;
  priceMax: string;
  inStockOnly: boolean;
}

const INITIAL_FILTERS: Filters = {
  categories: [],
  materials: [],
  priceMin: "",
  priceMax: "",
  inStockOnly: false,
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const KNOWN_CATEGORIES = ["rings", "necklaces", "earrings", "bracelets"];
const KNOWN_MATERIALS = [
  "18k Gold",
  "14k Gold",
  "Sterling Silver",
  "Platinum",
  "Rose Gold",
];

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-square bg-secondary" />
      <div className="h-3 w-1/3 bg-secondary rounded" />
      <div className="h-5 w-2/3 bg-secondary rounded" />
      <div className="h-4 w-1/2 bg-secondary rounded" />
    </div>
  );
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  allCategories: string[];
  allMaterials: string[];
  onClose?: () => void;
}

function FilterPanel({
  filters,
  onChange,
  allCategories,
  allMaterials,
  onClose,
}: FilterPanelProps) {
  function toggleCategory(cat: string) {
    onChange({
      ...filters,
      categories: filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat],
    });
  }
  function toggleMaterial(mat: string) {
    onChange({
      ...filters,
      materials: filters.materials.includes(mat)
        ? filters.materials.filter((m) => m !== mat)
        : [...filters.materials, mat],
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header (mobile only) */}
      {onClose && (
        <div className="flex items-center justify-between">
          <p className="font-accent text-xs tracking-widest uppercase text-foreground">
            Filter
          </p>
          <button onClick={onClose} aria-label="Close filters" className="p-1 text-muted hover:text-foreground">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Category */}
      <div className="flex flex-col gap-3">
        <p className="font-accent text-[10px] tracking-widest uppercase text-foreground">
          Category
        </p>
        <div className="flex flex-col gap-2">
          {allCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="sr-only"
              />
              <span
                className={cn(
                  "size-4 border flex items-center justify-center shrink-0 transition-colors",
                  filters.categories.includes(cat)
                    ? "border-primary bg-primary"
                    : "border-border"
                )}
              >
                {filters.categories.includes(cat) && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="font-body text-sm text-muted group-hover:text-foreground transition-colors capitalize">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-3">
        <p className="font-accent text-[10px] tracking-widest uppercase text-foreground">
          Price Range
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
            className="w-full border border-border bg-transparent px-2.5 py-2 font-body text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
          />
          <span className="text-muted font-body text-sm shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
            className="w-full border border-border bg-transparent px-2.5 py-2 font-body text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Material */}
      {allMaterials.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-accent text-[10px] tracking-widest uppercase text-foreground">
            Material
          </p>
          <div className="flex flex-col gap-2">
            {allMaterials.map((mat) => (
              <label key={mat} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.materials.includes(mat)}
                  onChange={() => toggleMaterial(mat)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "size-4 border flex items-center justify-center shrink-0 transition-colors",
                    filters.materials.includes(mat)
                      ? "border-primary bg-primary"
                      : "border-border"
                  )}
                >
                  {filters.materials.includes(mat) && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="font-body text-sm text-muted group-hover:text-foreground transition-colors">
                  {mat}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* In-stock toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <span
          onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className={cn(
            "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full border border-transparent transition-colors cursor-pointer",
            filters.inStockOnly ? "bg-primary" : "bg-input"
          )}
        >
          <span
            className={cn(
              "pointer-events-none block size-4 rounded-full bg-background transition-transform",
              filters.inStockOnly ? "translate-x-[calc(100%-2px)]" : "translate-x-0"
            )}
          />
        </span>
        <span className="font-body text-sm text-muted">In stock only</span>
      </label>
    </div>
  );
}

interface ProductGridProps {
  initialProducts?: Product[];
  initialCategory?: string;
}

export default function ProductGrid({ initialProducts, initialCategory }: ProductGridProps) {
  // Catalog is provided by the server (Shopify) via initialProducts.
  const products = initialProducts ?? [];
  const isLoading = false;

  const [filters, setFilters] = useState<Filters>({
    ...INITIAL_FILTERS,
    categories: initialCategory ? [initialCategory] : [],
  });
  const [sort, setSort] = useState<SortOption>("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Derive unique categories/materials from actual products
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    KNOWN_CATEGORIES.forEach((c) => cats.add(c));
    products.forEach((p) => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [products]);

  const allMaterials = useMemo(() => {
    const mats = new Set<string>();
    KNOWN_MATERIALS.forEach((m) => mats.add(m));
    products.forEach((p) => { if (p.material) mats.add(p.material); });
    return Array.from(mats);
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let list = [...products];

    if (filters.categories.length > 0) {
      list = list.filter((p) => p.category && filters.categories.includes(p.category));
    }
    if (filters.materials.length > 0) {
      list = list.filter((p) => p.material && filters.materials.includes(p.material));
    }
    if (filters.priceMin !== "") {
      const minPaise = parseFloat(filters.priceMin) * 100;
      list = list.filter((p) => p.price >= minPaise);
    }
    if (filters.priceMax !== "") {
      const maxPaise = parseFloat(filters.priceMax) * 100;
      list = list.filter((p) => p.price <= maxPaise);
    }
    if (filters.inStockOnly) {
      list = list.filter((p) => p.available);
    }

    switch (sort) {
      case "featured":
        list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "newest":
        // Shopify already returns newest-first; preserve server order.
        break;
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
    }

    return list;
  }, [products, filters, sort]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.materials.length > 0 ||
    filters.priceMin !== "" ||
    filters.priceMax !== "" ||
    filters.inStockOnly;

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
  }

  return (
    <div className="max-w-[1320px] mx-auto px-6 py-[120px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 font-accent text-xs tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filter
          </button>

          {/* Active filter count */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 font-accent text-[10px] tracking-widest uppercase text-muted hover:text-foreground transition-colors"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <p className="hidden sm:block font-body text-sm text-muted">
              {filteredAndSorted.length} product{filteredAndSorted.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none font-accent text-xs tracking-widest uppercase text-foreground/70 bg-transparent border border-border pl-3 pr-8 py-2 outline-none hover:border-foreground transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
            >
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            allCategories={allCategories}
            allMaterials={allMaterials}
          />
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
              <p className="font-display text-3xl text-foreground">No products found</p>
              <p className="font-body text-sm text-muted max-w-xs">
                Try adjusting your filters or browse our full collection.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="font-accent text-xs tracking-widest uppercase border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {filteredAndSorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* Panel */}
          <div className="relative ml-auto w-80 max-w-full h-full bg-background overflow-y-auto p-6">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              allCategories={allCategories}
              allMaterials={allMaterials}
              onClose={() => setMobileFilterOpen(false)}
            />
            <div className="mt-8">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-foreground text-background font-accent text-xs tracking-widest uppercase py-3.5 hover:bg-primary transition-colors"
              >
                View {filteredAndSorted.length} result{filteredAndSorted.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
