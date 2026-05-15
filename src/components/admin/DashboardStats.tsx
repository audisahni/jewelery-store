"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Order, Product } from "@/types";

interface Stats {
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  recentOrders: Order[];
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 bg-muted/30 rounded animate-pulse mb-2" />
        <div className="h-3 w-20 bg-muted/20 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        const orders: Order[] = Array.isArray(ordersData) ? ordersData : ordersData.orders ?? [];
        const products: Product[] = Array.isArray(productsData) ? productsData : productsData.products ?? [];

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const revenueThisMonth = orders
          .filter((o) => {
            const d = o.createdAt ? new Date(o.createdAt) : null;
            return d && d >= thisMonthStart && (o.status === "paid" || o.status === "shipped" || o.status === "delivered");
          })
          .reduce((sum, o) => sum + (o.total ?? 0), 0);

        const revenueLastMonth = orders
          .filter((o) => {
            const d = o.createdAt ? new Date(o.createdAt) : null;
            return (
              d &&
              d >= lastMonthStart &&
              d <= lastMonthEnd &&
              (o.status === "paid" || o.status === "shipped" || o.status === "delivered")
            );
          })
          .reduce((sum, o) => sum + (o.total ?? 0), 0);

        const pendingOrders = orders.filter((o) => o.status === "pending").length;
        const paidOrders = orders.filter((o) => o.status === "paid").length;
        const shippedOrders = orders.filter((o) => o.status === "shipped").length;

        const activeProducts = products.filter((p) => p.active).length;
        const lowStockProducts = products.filter(
          (p) => p.stock !== null && p.stock !== undefined && p.stock <= 3 && p.active
        ).length;

        const recentOrders = [...orders]
          .sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
          })
          .slice(0, 5);

        setStats({
          revenueThisMonth,
          revenueLastMonth,
          totalOrders: orders.length,
          pendingOrders,
          paidOrders,
          shippedOrders,
          totalProducts: products.length,
          activeProducts,
          lowStockProducts,
          recentOrders,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!stats) return null;

  const revenueChange =
    stats.revenueLastMonth > 0
      ? ((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100
      : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-muted font-normal">
              Revenue This Month
            </CardTitle>
            <DollarSign size={18} className="text-muted" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl text-foreground">
              {formatPrice(stats.revenueThisMonth)}
            </p>
            {revenueChange !== null && (
              <div className="flex items-center gap-1 mt-1">
                {revenueChange >= 0 ? (
                  <TrendingUp size={14} className="text-emerald-600" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span
                  className={`text-xs font-body ${revenueChange >= 0 ? "text-emerald-600" : "text-red-500"}`}
                >
                  {revenueChange >= 0 ? "+" : ""}
                  {revenueChange.toFixed(1)}% vs last month
                </span>
              </div>
            )}
            {revenueChange === null && (
              <p className="text-xs text-muted mt-1">No data from last month</p>
            )}
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-muted font-normal">
              Total Orders
            </CardTitle>
            <ShoppingCart size={18} className="text-muted" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl text-foreground">{stats.totalOrders}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {stats.pendingOrders > 0 && (
                <span className="text-[10px] font-accent uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                  {stats.pendingOrders} pending
                </span>
              )}
              {stats.paidOrders > 0 && (
                <span className="text-[10px] font-accent uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                  {stats.paidOrders} paid
                </span>
              )}
              {stats.shippedOrders > 0 && (
                <span className="text-[10px] font-accent uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  {stats.shippedOrders} shipped
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-muted font-normal">
              Products
            </CardTitle>
            <Package size={18} className="text-muted" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl text-foreground">{stats.totalProducts}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted">{stats.activeProducts} active</span>
              {stats.lowStockProducts > 0 && (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle size={11} />
                  {stats.lowStockProducts} low stock
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-body text-muted font-normal">
              Recent Activity
            </CardTitle>
            <Activity size={18} className="text-muted" />
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-muted">No recent orders</p>
            ) : (
              <ul className="space-y-1.5">
                {stats.recentOrders.slice(0, 3).map((order) => (
                  <li key={order.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted truncate max-w-[100px]">
                      {order.customerName ?? order.customerEmail ?? "Guest"}
                    </span>
                    <span className="font-body text-foreground">
                      {formatPrice(order.total ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
