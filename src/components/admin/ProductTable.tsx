"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Edit, Trash2, ChevronUp, ChevronDown, Search, Package } from "lucide-react";

type SortKey = "name" | "category" | "price" | "stock";
type SortDir = "asc" | "desc";

interface ProductTableProps {
  products: Product[];
  onRefresh: () => void;
}

export default function ProductTable({ products, onRefresh }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
    return Array.from(cats).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });

    list = [...list].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (sortKey === "name") { aVal = a.name; bVal = b.name; }
      else if (sortKey === "category") { aVal = a.category ?? ""; bVal = b.category ?? ""; }
      else if (sortKey === "price") { aVal = a.price; bVal = b.price; }
      else if (sortKey === "stock") { aVal = a.stock ?? 0; bVal = b.stock ?? 0; }

      if (typeof aVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - (bVal as number) : (bVal as number) - aVal;
    });

    return list;
  }, [products, search, categoryFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={14} className="text-muted/40" />;
    return sortDir === "asc" ? (
      <ChevronUp size={14} className="text-primary" />
    ) : (
      <ChevronDown size={14} className="text-primary" />
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, active: !product.active }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${product.name} ${!product.active ? "activated" : "deactivated"}`);
      onRefresh();
    } catch {
      toast.error("Failed to update product");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      const res = await fetch(`/api/products?id=${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${product.name} deleted`);
      onRefresh();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/products?id=${id}`, { method: "DELETE" })
        )
      );
      toast.success(`${selected.size} products deleted`);
      setSelected(new Set());
      setBulkDeleteOpen(false);
      onRefresh();
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => v !== null && setCategoryFilter(v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected.size > 0 && (
          <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
            <DialogTrigger render={<Button variant="destructive" size="sm" />}>
              <Trash2 size={14} className="mr-1.5" />
              Delete {selected.size} selected
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {selected.size} products?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted">This action cannot be undone.</p>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button variant="destructive" onClick={handleBulkDelete}>
                  Delete All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => toggleSort("name")}
                >
                  Name <SortIcon col="name" />
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => toggleSort("category")}
                >
                  Category <SortIcon col="category" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => toggleSort("price")}
                >
                  Price <SortIcon col="price" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => toggleSort("stock")}
                >
                  Stock <SortIcon col="stock" />
                </button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <Package size={32} className="mx-auto mb-3 text-muted" />
                  <p className="text-muted font-body">
                    {search || categoryFilter !== "all"
                      ? "No products match your filters."
                      : "No products yet. Add your first product."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow
                  key={product.id}
                  className={cn(selected.has(product.id) && "bg-primary/5")}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-secondary relative shrink-0">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-muted" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-body text-sm font-medium text-foreground truncate max-w-[160px]">
                      {product.name}
                    </p>
                    {product.material && (
                      <p className="text-xs text-muted">{product.material}</p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {product.category ? (
                      <span className="text-xs font-accent uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-muted">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-xs text-muted/50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-body text-sm">{formatPrice(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-muted line-through ml-1.5">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className={cn(
                        "text-sm font-body",
                        (product.stock ?? 0) <= 3 && (product.stock ?? 0) > 0
                          ? "text-amber-600"
                          : (product.stock ?? 0) === 0
                          ? "text-red-500"
                          : "text-foreground"
                      )}
                    >
                      {product.stock ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Switch
                      checked={product.active ?? false}
                      disabled={togglingId === product.id}
                      onCheckedChange={() => handleToggleActive(product)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit size={15} />
                        </Button>
                      </Link>
                      <Dialog>
                        <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-destructive" />}>
                          <Trash2 size={15} />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Product</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-muted">
                            Are you sure you want to delete "{product.name}"? This cannot be
                            undone.
                          </p>
                          <DialogFooter>
                            <DialogClose render={<Button variant="outline" />}>
                              Cancel
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(product)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted text-right">
          {filtered.length} of {products.length} products
        </p>
      )}
    </div>
  );
}
