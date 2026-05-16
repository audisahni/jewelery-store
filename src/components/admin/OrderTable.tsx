"use client";

import { useState, useMemo } from "react";
import { Order } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ChevronDown, ChevronUp, Search, ShoppingCart } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

const ALL_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

const STATUS_LABELS: Record<string, { label: string; hint: string }> = {
  pending:   { label: "Pending",   hint: "Payment not yet confirmed" },
  paid:      { label: "Paid",      hint: "Payment received, ready to ship" },
  shipped:   { label: "Shipped",   hint: "Package sent, in transit" },
  delivered: { label: "Delivered", hint: "Customer received the order" },
  cancelled: { label: "Cancelled", hint: "Order was cancelled" },
};

interface OrderTableProps {
  orders: Order[];
  onRefresh: () => void;
}

interface ExpandedState {
  newStatus: string;
  trackingNumber: string;
  saving: boolean;
}

export default function OrderTable({ orders, onRefresh }: OrderTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedState, setExpandedState] = useState<Record<string, ExpandedState>>({});

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        (o.customerEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (o.customerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || o.status === statusFilter;

      const orderDate = o.createdAt ? new Date(o.createdAt) : null;
      const matchFrom = !dateFrom || (orderDate && orderDate >= new Date(dateFrom));
      const matchTo = !dateTo || (orderDate && orderDate <= new Date(dateTo + "T23:59:59"));

      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  const getExpanded = (id: string): ExpandedState => {
    const order = orders.find((o) => o.id === id);
    return (
      expandedState[id] ?? {
        newStatus: order?.status ?? "pending",
        trackingNumber: order?.trackingNumber ?? "",
        saving: false,
      }
    );
  };

  const setExpanded = (id: string, patch: Partial<ExpandedState>) => {
    setExpandedState((prev) => ({
      ...prev,
      [id]: { ...getExpanded(id), ...patch },
    }));
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      const order = orders.find((o) => o.id === id);
      setExpandedState((prev) => ({
        ...prev,
        [id]: {
          newStatus: order?.status ?? "pending",
          trackingNumber: order?.trackingNumber ?? "",
          saving: false,
        },
      }));
      setExpandedId(id);
    }
  };

  const handleSaveOrder = async (order: Order) => {
    const state = getExpanded(order.id);
    setExpanded(order.id, { saving: true });
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          status: state.newStatus,
          trackingNumber: state.trackingNumber || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order updated successfully");
      onRefresh();
    } catch {
      toast.error("Failed to update order");
    } finally {
      setExpanded(order.id, { saving: false });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const shortId = (id: string) => id.slice(0, 8).toUpperCase();

  const getItemCount = (items: unknown): number => {
    if (!items) return 0;
    if (Array.isArray(items)) return items.length;
    if (typeof items === "string") {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  };

  const getItemsList = (items: unknown): Array<{ name?: string; quantity?: number; price?: number }> => {
    if (!items) return [];
    let list = items;
    if (typeof items === "string") {
      try { list = JSON.parse(items); } catch { return []; }
    }
    if (Array.isArray(list)) return list as Array<{ name?: string; quantity?: number; price?: number }>;
    return [];
  };

  const formatAddress = (addr: unknown): string => {
    if (!addr) return "—";
    let obj = addr;
    if (typeof addr === "string") {
      try { obj = JSON.parse(addr); } catch { return String(addr); }
    }
    if (typeof obj === "object" && obj !== null) {
      const a = obj as Record<string, string>;
      return [a.line1, a.line2, a.city, a.state, a.postal_code, a.country]
        .filter(Boolean)
        .join(", ");
    }
    return String(addr);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by customer or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]?.label ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36 text-sm"
            placeholder="From"
          />
          <span className="text-muted text-sm">—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36 text-sm"
            placeholder="To"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-8" />
              <TableHead>Order</TableHead>
              <TableHead className="hidden sm:table-cell">Customer</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden lg:table-cell">Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <ShoppingCart size={32} className="mx-auto mb-3 text-muted" />
                  <p className="text-foreground font-body font-medium mb-1">
                    {search || statusFilter !== "all" || dateFrom || dateTo
                      ? "No orders match your filters"
                      : "No orders yet"}
                  </p>
                  <p className="text-muted font-body text-sm max-w-xs mx-auto">
                    {search || statusFilter !== "all" || dateFrom || dateTo
                      ? "Try adjusting your search or filter criteria."
                      : "When a customer completes a purchase, their order will appear here automatically."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const isExpanded = expandedId === order.id;
                const state = getExpanded(order.id);
                const items = getItemsList(order.items);

                return (
                  <>
                    <TableRow
                      key={order.id}
                      className={cn(
                        "cursor-pointer hover:bg-secondary/30 transition-colors",
                        isExpanded && "bg-secondary/30"
                      )}
                      onClick={() => toggleExpand(order.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-muted" />
                        ) : (
                          <ChevronDown size={14} className="text-muted" />
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-accent text-xs tracking-wider text-foreground">
                          #{shortId(order.id)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          <p className="text-sm font-body text-foreground">
                            {order.customerName ?? "—"}
                          </p>
                          <p className="text-xs text-muted">{order.customerEmail ?? ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted">{formatDate(order.createdAt)}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted">{getItemCount(order.items)} items</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm font-medium">
                          {formatPrice(order.total ?? 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-[11px] font-accent uppercase tracking-wider px-2 py-1 rounded",
                            STATUS_COLORS[order.status ?? "pending"] ?? "bg-secondary text-muted"
                          )}
                        >
                          {order.status ?? "pending"}
                        </span>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow key={`${order.id}-expanded`} className="bg-secondary/20">
                        <TableCell colSpan={7} className="p-0">
                          <div
                            className="px-6 py-5 space-y-5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Items */}
                              <div>
                                <p className="text-xs font-accent uppercase tracking-wider text-muted mb-2">
                                  Items
                                </p>
                                {items.length === 0 ? (
                                  <p className="text-sm text-muted">No item data</p>
                                ) : (
                                  <ul className="space-y-1.5">
                                    {items.map((item, i) => (
                                      <li key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-foreground">
                                          {item.name ?? "Product"}{" "}
                                          {item.quantity && item.quantity > 1 && (
                                            <span className="text-muted">×{item.quantity}</span>
                                          )}
                                        </span>
                                        {item.price !== undefined && (
                                          <span className="text-muted">{formatPrice(item.price)}</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
                                  <div className="flex justify-between text-muted">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal ?? 0)}</span>
                                  </div>
                                  <div className="flex justify-between text-muted">
                                    <span>Shipping</span>
                                    <span>{formatPrice(order.shipping ?? 0)}</span>
                                  </div>
                                  <div className="flex justify-between font-medium text-foreground">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total ?? 0)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Shipping Address */}
                              <div>
                                <p className="text-xs font-accent uppercase tracking-wider text-muted mb-2">
                                  Shipping Address
                                </p>
                                <p className="text-sm text-foreground leading-relaxed">
                                  {formatAddress(order.shippingAddress)}
                                </p>
                              </div>

                              {/* Update Order */}
                              <div className="space-y-4">
                                <p className="text-xs font-accent uppercase tracking-wider text-muted">
                                  Update Order
                                </p>
                                <div className="space-y-2">
                                  <Label className="text-xs">Status</Label>
                                  <Select
                                    value={state.newStatus}
                                    onValueChange={(v) => v !== null && setExpanded(order.id, { newStatus: v })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ALL_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                          <span className="flex flex-col">
                                            <span>{STATUS_LABELS[s]?.label ?? s}</span>
                                            <span className="text-xs text-muted font-normal">{STATUS_LABELS[s]?.hint}</span>
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Tracking Number</Label>
                                  <Input
                                    value={state.trackingNumber ?? ""}
                                    onChange={(e) =>
                                      setExpanded(order.id, { trackingNumber: e.target.value })
                                    }
                                    placeholder="e.g. 1Z999AA10123456784"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  disabled={state.saving}
                                  onClick={() => handleSaveOrder(order)}
                                  className="w-full bg-foreground text-background hover:bg-primary"
                                >
                                  {state.saving ? "Saving..." : "Save Changes"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted text-right">
          {filtered.length} of {orders.length} orders
        </p>
      )}
    </div>
  );
}
