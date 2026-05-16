"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
import ImageUploader from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, Minus, Plus, Trash2 } from "lucide-react";
import { Product } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  price: z.number({ message: "Price required" }).min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),
  category: z.string().optional(),
  material: z.string().optional(),
  images: z.array(z.string()),
  primaryImage: z.string().optional(),
  stock: z.number().int().min(0),
  featured: z.boolean(),
  active: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  weight: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSale, setShowSale] = useState(!!product?.compareAtPrice);
  const [showSeo, setShowSeo] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!product);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product ? product.price / 100 : 0,
      compareAtPrice: product?.compareAtPrice ? product.compareAtPrice / 100 : null,
      category: product?.category ?? "",
      material: product?.material ?? "",
      images: (product?.images as string[]) ?? [],
      primaryImage: product?.primaryImage ?? "",
      stock: product?.stock ?? 0,
      featured: product?.featured ?? false,
      active: product?.active ?? false,
      metaTitle: product?.metaTitle ?? "",
      metaDescription: product?.metaDescription ?? "",
      weight: product?.weight ?? undefined,
    },
  });

  const watchedName = watch("name");
  const watchedImages = watch("images");
  const watchedMetaTitle = watch("metaTitle");
  const watchedMetaDesc = watch("metaDescription");
  const watchedSlug = watch("slug");
  const watchedStock = watch("stock");
  const watchedFeatured = watch("featured");
  const watchedActive = watch("active");

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && watchedName) {
      setValue("slug", generateSlug(watchedName));
    }
  }, [watchedName, slugManuallyEdited, setValue]);

  // Auto-fill metaTitle from name (only when empty)
  useEffect(() => {
    if (watchedName && !watch("metaTitle")) {
      setValue("metaTitle", watchedName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedName]);

  const onSubmit = async (values: FormValues, publishNow = false) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        price: Math.round(values.price * 100),
        compareAtPrice: values.compareAtPrice ? Math.round(values.compareAtPrice * 100) : null,
        primaryImage: values.images[0] ?? "",
        active: publishNow ? true : values.active,
      };

      const method = product ? "PATCH" : "POST";
      const body = product ? { id: product.id, ...payload } : payload;

      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save product");

      toast.success(product ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    try {
      const res = await fetch(`/api/products?id=${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <form onSubmit={handleSubmit((v: FormValues) => onSubmit(v, false))} className="space-y-8 max-w-4xl">
      {/* Images */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Product Images</Label>
        <ImageUploader
          images={watchedImages}
          onChange={(imgs) => {
            setValue("images", imgs);
            setValue("primaryImage", imgs[0] ?? "");
          }}
        />
      </div>

      <Separator />

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g. Kundan Meenakari Necklace"
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug *</Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              {...register("slug")}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                register("slug").onChange(e);
              }}
              placeholder="lumiere-diamond-ring"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSlugManuallyEdited(false);
                setValue("slug", generateSlug(watchedName));
              }}
            >
              Auto
            </Button>
          </div>
          {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
          <p className="text-xs text-muted">yourdomain.com/shop/{watchedSlug || "slug"}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={watch("category") || ""}
            onValueChange={(v) => v !== null && setValue("category", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rings">Rings</SelectItem>
              <SelectItem value="necklaces">Necklaces</SelectItem>
              <SelectItem value="earrings">Earrings</SelectItem>
              <SelectItem value="bracelets">Bracelets</SelectItem>
              <SelectItem value="bangles">Bangles</SelectItem>
              <SelectItem value="maang-tikka">Maang Tikka</SelectItem>
              <SelectItem value="anklets">Anklets</SelectItem>
              <SelectItem value="nose-rings">Nose Rings</SelectItem>
              <SelectItem value="sets">Jewelry Sets</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={5}
            placeholder="Describe the piece — its inspiration, the techniques used, and what makes it unique..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            {...register("material")}
            placeholder="e.g. Sterling Silver, Kundan, Polki Diamonds"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (grams)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            {...register("weight", { valueAsNumber: true })}
            placeholder="0.0"
          />
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="font-display text-lg">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹ INR) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                ₹
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className="pl-7"
                {...register("price", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="text-destructive text-xs">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <Switch
                checked={showSale}
                onCheckedChange={(checked) => {
                  setShowSale(checked);
                  if (!checked) setValue("compareAtPrice", null);
                }}
              />
              <Label>On Sale (show original price crossed out)</Label>
            </div>
            {showSale && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                  ₹
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  placeholder="Original price before discount"
                  {...register("compareAtPrice", { valueAsNumber: true })}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Inventory */}
      <div className="space-y-4">
        <h3 className="font-display text-lg">Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Stock Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setValue("stock", Math.max(0, (watchedStock ?? 0) - 1))}
              >
                <Minus size={14} />
              </Button>
              <Input
                type="number"
                min="0"
                className="text-center w-20"
                {...register("stock", { valueAsNumber: true })}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setValue("stock", (watchedStock ?? 0) + 1)}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Visibility</Label>
            <div className="flex items-center gap-3">
              <Switch
                checked={watchedActive}
                onCheckedChange={(v) => setValue("active", v)}
              />
              <span className="text-sm">{watchedActive ? "Active" : "Draft"}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Featured</Label>
            <div className="flex items-center gap-3">
              <Switch
                checked={watchedFeatured}
                onCheckedChange={(v) => setValue("featured", v)}
              />
              <span className="text-sm">{watchedFeatured ? "Featured" : "Not featured"}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* SEO — Collapsible */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowSeo(!showSeo)}
          className="flex items-center gap-2 font-display text-lg hover:text-primary transition-colors"
        >
          {showSeo ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          SEO
        </button>

        {showSeo && (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                {...register("metaTitle")}
                placeholder={watchedName ? `${watchedName} | Fine Jewelry` : "Meta title"}
                maxLength={60}
              />
              <p className="text-xs text-muted">
                {(watchedMetaTitle ?? "").length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                {...register("metaDescription")}
                rows={3}
                placeholder="Compelling description for search engines..."
                maxLength={155}
              />
              <p className="text-xs text-muted">
                {(watchedMetaDesc ?? "").length}/155 characters
              </p>
            </div>

            {/* Google Preview */}
            <div className="border border-border rounded-lg p-4 bg-secondary/30">
              <p className="text-xs text-muted uppercase tracking-widest font-accent mb-3">
                Search Preview
              </p>
              <div className="space-y-1">
                <p className="text-[#1a0dab] text-lg font-normal hover:underline cursor-pointer truncate">
                  {watchedMetaTitle || watchedName || "Product Title"}
                </p>
                <p className="text-[#006621] text-sm truncate">
                  yourdomain.com/shop/{watchedSlug || "slug"}
                </p>
                <p className="text-[#545454] text-sm line-clamp-2">
                  {watchedMetaDesc ||
                    "Add a meta description to preview how this product appears in search results."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => handleSubmit((v: FormValues) => onSubmit(v, false))()}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          className="bg-foreground text-background hover:bg-primary"
          onClick={() => handleSubmit((v: FormValues) => onSubmit(v, true))()}
        >
          {isSubmitting
            ? "Saving..."
            : product
            ? "Update Product"
            : "Publish Product"}
        </Button>

        {product && (
          <div className="ml-auto">
            <Dialog>
              <DialogTrigger render={<Button type="button" variant="destructive" />}>
                <Trash2 size={14} className="mr-2" />
                Delete
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Product</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted">
                  Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be
                  undone.
                </p>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete Product
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </form>
  );
}
