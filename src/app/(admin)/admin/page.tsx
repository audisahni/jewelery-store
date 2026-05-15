import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardStats from "@/components/admin/DashboardStats";
import OrderTable from "@/components/admin/OrderTable";
import Link from "next/link";
import { Plus, Package, ShoppingCart } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  let recentOrders = [];
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/orders`, { cache: "no-store" });
    if (res.ok) recentOrders = await res.json();
  } catch {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
          <p className="font-body text-sm text-muted mt-1">Welcome back to Lumière Admin</p>
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

      {/* Stats */}
      <DashboardStats />

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
      {recentOrders.length > 0 && (
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
    </div>
  );
}
