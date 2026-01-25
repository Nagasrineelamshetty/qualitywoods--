// // import { useEffect, useState } from 'react';
// // import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
// // import { Card } from '../components/ui/card';
// // import { toast } from '../hooks/use-toast';
// // import axios from '../api/axios';
// // import { useAuth } from '../contexts/AuthContext';

// // const statusSteps = [
// //   { key: 'Received', label: 'Order Received', icon: Package, description: 'Your order has been confirmed' },
// //   { key: 'In Production', label: 'In Production', icon: Clock, description: 'Our craftsmen are working on your furniture' },
// //   { key: 'Shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
// //   { key: 'Delivered', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' },
// // ];

// // const DeliveryTracking = () => {
// //   const { user } = useAuth();
// //   const [orders, setOrders] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const fetchOrders = async () => {
// //       if (!user?._id) {
// //         toast({ title: 'Login required', description: 'Please login to view your orders.', variant: 'destructive' });
// //         setLoading(false);
// //         return;
// //       }

// //       try {
// //         const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
// //         const res = await axios.get(`/api/orders/user/${user._id}`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //         setOrders(res.data);
// //       } catch (error) {
// //         toast({ title: 'Failed to fetch orders', variant: 'destructive' });
// //         console.error(error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchOrders();
// //   }, [user]);

// //   const getCurrentStepIndex = (status: string) =>
// //     statusSteps.findIndex(step => step.key === status);

// //   const getStepStatus = (stepIndex: number, currentIndex: number) => {
// //     if (stepIndex < currentIndex) return 'completed';
// //     if (stepIndex === currentIndex) return 'current';
// //     return 'pending';
// //   };

// //   return (
// //     <div className="min-h-screen bg-stone-50 py-8">
// //       <div className="max-w-5xl mx-auto px-4">
// //         <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">Your Orders</h1>

// //         {loading ? (
// //           <p className="text-center text-stone-500">Loading orders...</p>
// //         ) : orders.length === 0 ? (
// //           <p className="text-center text-stone-500">You have no orders yet.</p>
// //         ) : (
// //           orders.map((order, index) => {
// //             const currentStepIndex = getCurrentStepIndex(order.status);

// //             return (
// //               <Card key={index} className="mb-8 p-6 bg-white shadow">
// //                 <div className="mb-4">
// //                   <h2 className="text-2xl font-semibold text-amber-900">Order #{order.razorpayOrderId}</h2>
// //                   <p className="text-stone-600">
// //                     Total: ₹{order.total.toLocaleString()} • Placed on: {new Date(order.createdAt).toLocaleDateString()}
// //                   </p>
// //                 </div>

// //                 <div className="mb-4">
// //                   <h3 className="text-lg font-medium text-stone-700 mb-2">Items:</h3>
// //                   <ul className="list-disc list-inside text-stone-600">
// //                     {order.items.map((item: any, idx: number) => (
// //                       <li key={idx}>
// //                         {item.name} (Qty: {item.quantity}) – {item.customizations?.wood}, {item.customizations?.finish}, {item.customizations?.dimensions}
// //                       </li>
// //                     ))}
// //                   </ul>
// //                 </div>

// //                 <div className="mt-4">
// //                   <h3 className="text-lg font-semibold text-amber-900 mb-4">Delivery Status</h3>
// //                   <div className="relative">
// //                     {statusSteps.map((step, stepIndex) => {
// //                       const stepStatus = getStepStatus(stepIndex, currentStepIndex);
// //                       const StepIcon = step.icon;

// //                       return (
// //                         <div key={step.key} className="relative flex items-start mb-8 last:mb-0">
// //                           {stepIndex < statusSteps.length - 1 && (
// //                             <div className={`absolute left-6 top-12 w-0.5 h-16 ${stepStatus === 'completed' ? 'bg-green-500' : 'bg-stone-200'}`} />
// //                           )}

// //                           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
// //                             stepStatus === 'completed' ? 'bg-green-500 text-white' :
// //                             stepStatus === 'current' ? 'bg-amber-500 text-white' :
// //                             'bg-stone-200 text-stone-400'
// //                           }`}>
// //                             <StepIcon size={20} />
// //                           </div>

// //                           <div className="ml-4 flex-1">
// //                             <h4 className={`text-lg font-semibold ${
// //                               stepStatus === 'completed' ? 'text-green-700' :
// //                               stepStatus === 'current' ? 'text-amber-700' :
// //                               'text-stone-400'
// //                             }`}>{step.label}</h4>
// //                             <p className={`text-sm ${
// //                               stepStatus === 'completed' ? 'text-green-600' :
// //                               stepStatus === 'current' ? 'text-amber-600' :
// //                               'text-stone-400'
// //                             }`}>{step.description}</p>
// //                           </div>
// //                         </div>
// //                       );
// //                     })}
// //                   </div>
// //                 </div>
// //               </Card>
// //             );
// //           })
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default DeliveryTracking;
// import { useEffect, useState } from 'react';
// import { Phone, MessageCircle } from 'lucide-react';
// import { Card } from '../components/ui/card';
// import { toast } from '../hooks/use-toast';
// import axios from '../api/axios';
// import { useAuth } from '../contexts/AuthContext';

// const DeliveryTracking = () => {
//   const { user } = useAuth();
//   const [orders, setOrders] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       if (!user?._id) {
//         toast({
//           title: 'Login required',
//           description: 'Please login to view your orders.',
//           variant: 'destructive',
//         });
//         setLoading(false);
//         return;
//       }

//       try {
//         const token =
//           localStorage.getItem('accessToken') ||
//           sessionStorage.getItem('accessToken');

//         const res = await axios.get(`/api/orders/user/${user._id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setOrders(res.data);
//       } catch (error) {
//         toast({ title: 'Failed to fetch orders', variant: 'destructive' });
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [user]);

//   return (
//     <div className="min-h-screen bg-stone-50 py-8">
//       <div className="max-w-5xl mx-auto px-4">
//         <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">
//           Your Orders
//         </h1>

//         {loading ? (
//           <p className="text-center text-stone-500">Loading orders...</p>
//         ) : orders.length === 0 ? (
//           <p className="text-center text-stone-500">
//             You have no orders yet.
//           </p>
//         ) : (
//           orders.map((order, index) => (
//             <Card key={index} className="mb-8 p-6 bg-white shadow">
//               {/* Order Info */}
//               <div className="mb-4">
//                 <h2 className="text-2xl font-semibold text-amber-900">
//                   Order #{order.razorpayOrderId}
//                 </h2>
//                 <p className="text-stone-600">
//                   Total: ₹{order.total.toLocaleString()} • Placed on:{' '}
//                   {new Date(order.createdAt).toLocaleDateString()}
//                 </p>
//               </div>

//               {/* Items */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-medium text-stone-700 mb-2">
//                   Items:
//                 </h3>
//                 <ul className="list-disc list-inside text-stone-600">
//                   {order.items.map((item: any, idx: number) => (
//                     <li key={idx}>
//                       {item.name} (Qty: {item.quantity}) {' '}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* Order Status */}
//               <div className="mt-4 border-t pt-4">
//                 <h3 className="text-lg font-semibold text-amber-900 mb-2">
//                   Order Status
//                 </h3>

//                 <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg">
//                   <Phone className="w-5 h-5 text-amber-700 mt-1" />
//                   <p className="text-stone-700">
//                     Your order has been confirmed. Our team will contact you via{' '}
//                     <span className="font-medium">call or WhatsApp</span> to
//                     share production and delivery updates.
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-2 text-sm text-stone-500 mt-2">
//                   <MessageCircle className="w-4 h-4" />
//                   <span>
//                     Delivery timelines may vary for custom furniture orders.
//                   </span>
//                 </div>
//               </div>
//             </Card>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default DeliveryTracking;
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
