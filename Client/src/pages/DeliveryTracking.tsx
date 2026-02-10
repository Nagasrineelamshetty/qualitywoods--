
import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  Package,
  Clock,
  Truck,
  CheckCircle,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { toast } from "../hooks/use-toast";
import axios from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const STATUS_STEPS = [
  { key: "Received", label: "Order Received", icon: Package },
  { key: "In Production", label: "In Production", icon: Clock },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_MESSAGE: Record<string, string> = {
  Received:
    "Your order has been confirmed. Our team will contact you via call or WhatsApp to share production and delivery updates.",
  "In Production":
    "Your furniture is currently being crafted. Our team may contact you if any confirmation is required.",
  Shipped:
    "Your order has been shipped. Our delivery partner will contact you before delivery.",
  Delivered:
    "Your order has been delivered successfully. We hope you love your furniture!",
};

const DeliveryTracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user?._id) return;

    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      const res = await axios.get(`/api/orders/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data);
    } catch {
      toast({ title: "Failed to fetch orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStepIndex = (status: string) =>
    STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">
          Your Orders
        </h1>

        {loading ? (
          <p className="text-center text-stone-500">Loading orders...</p>
        ) : (
          orders.map((order, index) => {
            const currentStep = getStepIndex(order.status);

            // ✅ Progress always green
            const progressPercent =
              ((currentStep + 1) / STATUS_STEPS.length) * 100;

            return (
              <Card key={index} className="mb-8 p-6 bg-white shadow">
                {/* Order Info */}
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-amber-900">
                    Order #{order.razorpayOrderId}
                  </h2>
                  <p className="text-stone-600">
                    Total: ₹{order.total.toLocaleString()} • Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-stone-600 mt-1">
                    <span className="font-medium">Estimated Delivery:</span>{" "}
                    {order.estimatedDelivery
                      ? new Date(
                          order.estimatedDelivery
                        ).toLocaleDateString()
                      : "To be confirmed"}
                  </p>
                </div>

                {/* Order Progress */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">
                    Order Progress
                  </h3>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-stone-200 rounded-full mb-6">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Step Icons (ALL ORANGE) */}
                  <div className="flex justify-between">
                    {STATUS_STEPS.map((step) => {
                      const Icon = step.icon;

                      return (
                        <div
                          key={step.key}
                          className="flex flex-col items-center text-center w-1/4"
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-amber-500 text-white">
                            <Icon size={18} />
                          </div>

                          <p className="text-xs font-medium text-amber-700">
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Message */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg">
                    <Phone className="w-5 h-5 text-amber-700 mt-1" />
                    <p className="text-stone-700">
                      {STATUS_MESSAGE[order.status]}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-500 mt-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      Delivery timelines may vary for custom furniture orders.
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
