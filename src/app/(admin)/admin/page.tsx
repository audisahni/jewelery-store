import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardStats from "@/components/admin/DashboardStats";
import OrderTable from "@/components/admin/OrderTable";
import Link from "next/link";
import { ShoppingCart, Settings, Store, Package, ArrowRight, ExternalLink } from "lucide-react";
import { getOrders } from "@/lib/data";

function shopifyAdminUrl(): string | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain || domain.includes("your-store")) return null;
  const host = domain.includes(".") ? domain : `${domain}.myshopify.com`;
  return `https://${host}/admin`;
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const recentOrders = await getOrders();
  const hasOrders = recentOrders.length > 0;
  const shopifyUrl = shopifyAdminUrl();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
          <p className="font-body text-sm text-muted mt-1">Welcome back to EZMAY Admin</p>
        </div>
        {shopifyUrl && (
          <a
            href={`${shopifyUrl}/products`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-foreground text-background font-accent text-xs tracking-wider uppercase px-4 py-2.5 hover:bg-primary transition-colors"
          >
            <Package size={14} />
            Manage Products in Shopify
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Where things live now */}
      <div className="border border-primary/30 bg-primary/5 p-6 space-y-3">
        <h2 className="font-display text-lg text-foreground">Products &amp; checkout live in Shopify</h2>
        <p className="font-body text-sm text-muted max-w-2xl">
          Catalog, inventory, pricing, payments (UPI/EMI via Razorpay), and GST are managed in
          your Shopify store. This dashboard mirrors orders for fulfillment and reporting. Orders
          appear here automatically once a customer checks out.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {shopifyUrl && (
            <a
              href={shopifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-accent text-xs tracking-wider uppercase text-primary hover:underline"
            >
              Open Shopify Admin <ExternalLink size={12} />
            </a>
          )}
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1 font-accent text-xs tracking-wider uppercase text-primary hover:underline"
          >
            Store Settings <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Stats — only when there are orders */}
      {hasOrders && <DashboardStats />}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          href="/admin/orders"
          className="flex flex-col items-center gap-2 p-6 bg-background border border-border hover:border-primary hover:text-primary transition-colors text-foreground"
        >
          <ShoppingCart size={20} />
          <span className="font-accent text-xs tracking-wider uppercase">View Orders</span>
        </Link>
        <Link
          href="/admin/settings"
          className="flex flex-col items-center gap-2 p-6 bg-background border border-border hover:border-primary hover:text-primary transition-colors text-foreground"
        >
          <Settings size={20} />
          <span className="font-accent text-xs tracking-wider uppercase">Settings</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="flex flex-col items-center gap-2 p-6 bg-background border border-border hover:border-primary hover:text-primary transition-colors text-foreground"
        >
          <Store size={20} />
          <span className="font-accent text-xs tracking-wider uppercase">View Store</span>
        </Link>
      </div>

      {/* Recent Orders */}
      {hasOrders ? (
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
      ) : (
        <div className="border border-border p-8 text-center space-y-3">
          <ShoppingCart size={32} className="mx-auto text-muted" />
          <p className="font-display text-lg text-foreground">No orders yet</p>
          <p className="font-body text-sm text-muted max-w-md mx-auto">
            When customers complete a purchase through Shopify checkout, their orders will appear
            here automatically. Share your store link to start getting sales.
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
