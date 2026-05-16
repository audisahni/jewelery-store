import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardStats from "@/components/admin/DashboardStats";
import OrderTable from "@/components/admin/OrderTable";
import Link from "next/link";
import { Plus, Package, ShoppingCart, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { getOrders, getProducts } from "@/lib/data";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [recentOrders, allProducts] = await Promise.all([
    getOrders(),
    getProducts({ activeOnly: false }),
  ]);

  const hasProducts = allProducts.length > 0;
  const hasOrders = recentOrders.length > 0;
  const isNewStore = !hasProducts && !hasOrders;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
          <p className="font-body text-sm text-muted mt-1">Welcome back to EZMAY Admin</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-foreground text-background font-accent text-xs tracking-wider uppercase px-4 py-2.5 hover:bg-primary transition-colors"
          >
            <Plus size={14} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Getting Started — only visible for new stores */}
      {isNewStore && (
        <div className="border border-primary/30 bg-primary/5 p-6 space-y-5">
          <div>
            <h2 className="font-display text-xl text-foreground">Welcome — let&apos;s set up your store</h2>
            <p className="font-body text-sm text-muted mt-1">
              Follow these steps to start selling. Each one takes just a few minutes.
            </p>
          </div>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <Circle size={20} className="text-muted mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-sm font-medium text-foreground">Add your first product</p>
                <p className="font-body text-xs text-muted mt-0.5">
                  Upload photos, set a price, and write a description. Your product will be hidden
                  until you publish it.
                </p>
                <Link
                  href="/admin/products/new"
                  className="inline-flex items-center gap-1 mt-2 font-accent text-xs tracking-wider uppercase text-primary hover:underline"
                >
                  Add Product <ArrowRight size={12} />
                </Link>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Circle size={20} className="text-muted mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-sm font-medium text-foreground">Customize your store</p>
                <p className="font-body text-xs text-muted mt-0.5">
                  Update your store name, homepage text, and contact email in Settings.
                </p>
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center gap-1 mt-2 font-accent text-xs tracking-wider uppercase text-primary hover:underline"
                >
                  Open Settings <ArrowRight size={12} />
                </Link>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Circle size={20} className="text-muted mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-sm font-medium text-foreground">Connect payment processing</p>
                <p className="font-body text-xs text-muted mt-0.5">
                  Add your Stripe secret key in the Cloudflare dashboard (Workers → jewelry-store →
                  Settings → Variables) so customers can pay.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Circle size={20} className="text-muted mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-sm font-medium text-foreground">Share your store</p>
                <p className="font-body text-xs text-muted mt-0.5">
                  Once products are published, your store is live. Share the link and your first
                  order will appear here automatically.
                </p>
                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-1 mt-2 font-accent text-xs tracking-wider uppercase text-primary hover:underline"
                >
                  View Store <ArrowRight size={12} />
                </Link>
              </div>
            </li>
          </ol>
        </div>
      )}

      {/* Stats — only when there is data to show */}
      {(hasProducts || hasOrders) && <DashboardStats />}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/admin/products/new", icon: Plus, label: "New Product" },
          { href: "/admin/products", icon: Package, label: "All Products" },
          { href: "/admin/orders", icon: ShoppingCart, label: "View Orders" },
          { href: "/", icon: Package, label: "View Store", external: true },
        ].map(action => (
          <Link
            key={action.href}
            href={action.href}
            target={action.external ? "_blank" : undefined}
            className="flex flex-col items-center gap-2 p-6 bg-background border border-border hover:border-primary hover:text-primary transition-colors text-foreground"
          >
            <action.icon size={20} />
            <span className="font-accent text-xs tracking-wider uppercase">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      {hasOrders && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-foreground">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="font-accent text-xs tracking-wider uppercase text-primary"
            >
              View All →
            </Link>
          </div>
          <OrderTable orders={recentOrders.slice(0, 10)} onRefresh={() => {}} />
        </div>
      )}

      {/* Products exist but no orders yet */}
      {hasProducts && !hasOrders && (
        <div className="border border-border p-8 text-center space-y-3">
          <ShoppingCart size={32} className="mx-auto text-muted" />
          <p className="font-display text-lg text-foreground">No orders yet</p>
          <p className="font-body text-sm text-muted max-w-md mx-auto">
            When customers complete a purchase, their orders will appear here. Share your store
            link to start getting sales.
          </p>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 font-accent text-xs tracking-wider uppercase text-primary hover:underline"
          >
            View your store <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
