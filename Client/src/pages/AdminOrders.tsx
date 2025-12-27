import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};
type Order = {
  _id: string;
  user: {
    name: string;
    email: string;
  } | null;
  items: OrderItem[]; 
  total: number;
  status: "Received" | "In Production" | "Shipped" | "Delivered";
  createdAt: string;
};

const STATUS_OPTIONS: Order["status"][] = [
  "Received",
  "In Production",
  "Shipped",
  "Delivered",
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders (admin)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders/admin/orders");
        setOrders(res.data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Update order status
  const updateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const res = await axios.put(
        `/api/orders/admin/orders/${orderId}/status`,
        { status }
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data : o))
      );

      toast({
        title: "Status updated",
        description: `Order marked as ${status}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-amber-900">Order Management</h1>

      {orders.map((order) => (
        <Card key={order._id} className="p-4 space-y-2">
  {/* User + Total */}
  <div className="flex justify-between items-center">
    <div>
      <p className="font-semibold">
        {order.user?.name || "Unknown User"}
      </p>
      <p className="text-sm text-stone-600">
        {order.user?.email || "—"}
      </p>
    </div>
    <p className="font-bold text-amber-700">₹{order.total}</p>
  </div>

  {/* ORDER ITEMS — ADD HERE */}
  <div className="mt-2 text-sm text-stone-700">
    {order.items.map((item, idx) => (
      <p key={idx}>
        {item.name} × {item.quantity}
      </p>
    ))}
  </div>

  {/* Status + Date */}
  <div className="flex justify-between items-center">
    <select
      value={order.status}
      onChange={(e) =>
        updateStatus(order._id, e.target.value as Order["status"])
      }
      className="border rounded px-2 py-1"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>

    <span className="text-sm text-stone-500">
      {new Date(order.createdAt).toLocaleDateString()}
    </span>
  </div>
</Card>
      ))}
    </div>
  );
};

export default AdminOrders;
