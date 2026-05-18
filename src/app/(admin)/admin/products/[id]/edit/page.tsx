import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductById } from "@/lib/data";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-muted font-accent text-xs tracking-widest uppercase mb-4 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Products
        </Link>
        <h1 className="font-display text-3xl text-foreground">Edit Product</h1>
        <p className="font-body text-sm text-muted mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
