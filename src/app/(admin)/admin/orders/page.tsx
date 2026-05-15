"use client";
import { useState, useEffect, useCallback } from "react";
import OrderTable from "@/components/admin/OrderTable";
import { Order } from "@/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Orders</h1>
        <p className="font-body text-sm text-muted mt-1">
          {loading ? "Loading..." : `${orders.length} total orders`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-secondary animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <OrderTable orders={orders} onRefresh={fetchOrders} />
      )}
    </div>
  );
}
