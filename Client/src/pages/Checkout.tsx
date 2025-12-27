import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Phone, User, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';
const API_BASE = import.meta.env.VITE_API_URL;
const Checkout = () => {
  const { state, clearCart, clearBuyNowItem } = useCart();
  const buyNowItem = state.buyNowItem;
  const { user } = useAuth();
  const navigate = useNavigate();

  // Buy Now state
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [currentBuyNowItem, setCurrentBuyNowItem] = useState<any>(null);

  useEffect(() => {
    const buyNowMode = window.location.search.includes('mode=buy-now');
    setIsBuyNow(buyNowMode);

    if (buyNowMode) {
      const itemFromState = buyNowItem;
      const itemFromStorage = JSON.parse(sessionStorage.getItem('buyNowItem') || 'null');

      const currentItem = itemFromState || itemFromStorage;

      if (!currentItem) {
        toast({ title: "Buy Now item not found", variant: "destructive" });
        navigate('/');
        return;
      }

      setCurrentBuyNowItem(currentItem);
    } else if (state.items.length === 0) {
      navigate('/cart');
    }
  }, [state.items, buyNowItem, navigate]);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = isBuyNow && currentBuyNowItem ? currentBuyNowItem.price : state.total;
  const shipping = subtotal > 50000 ? 0 : 2000;
  const tax = subtotal * 0.18;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleStateChange = (value: string) => {
    setShippingInfo({ ...shippingInfo, state: value });
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    return required.every(field => shippingInfo[field as keyof typeof shippingInfo]?.trim());
  };

  const generateCodOrderId = () => {
  const prefix = 'order_';
  const randomStr = Math.random().toString(36).substring(2, 12); // 10 char random string
  return prefix + randomStr;
};


  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const itemsToOrder = isBuyNow && currentBuyNowItem ? [currentBuyNowItem] : state.items;

      if (paymentMethod === 'cod') {
        // COD Order
        const token = localStorage.getItem('accessToken');
        const codOrderId = generateCodOrderId();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' ,
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              userId: user._id,
              razorpayOrderId: codOrderId,
              email: shippingInfo.email,
              items: itemsToOrder,
              total,
              estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: 'Received',
}),

        });

        if (!res.ok) throw new Error('Failed to place COD order');

        toast({
          title: "Order Created Successfully!",
          description: "Your COD order has been placed."
        });

        if (!isBuyNow) clearCart();
        if (isBuyNow) {
          clearBuyNowItem();
          localStorage.removeItem('buyNowItem');
        }

        navigate('/track');
      } else if (paymentMethod === 'razorpay') {
        initiateRazorpayPayment(itemsToOrder);
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateRazorpayPayment = async (items: any[]) => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({ amount: total})
      });

      const data = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Quality Woods',
        description: 'Custom Furniture Order',
        order_id: data.id,
        handler: async (response: any) => {
          try {
            const token = localStorage.getItem('accessToken')
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/orders/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
               },
              body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              email: shippingInfo.email,
              items,
              total,
              shippingInfo,
}),

            });

            const result = await verifyRes.json();

            if (verifyRes.ok) {
              toast({
                title: "Payment Successful!",
                description: "Your Razorpay order has been placed."
              });

              if (!isBuyNow) clearCart();
              if (isBuyNow) {
                clearBuyNowItem();
                localStorage.removeItem('buyNowItem');
              }

              navigate('/track');
            } else {
              toast({
                title: "Verification Failed",
                description: result.message || "Could not verify payment.",
                variant: "destructive"
              });
            }
          } catch (error) {
            toast({
              title: "Payment Error",
              description: "Something went wrong while verifying your payment.",
              variant: "destructive"
            });
            console.error(error);
          }
        },
        prefill: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          contact: shippingInfo.phone
        },
        theme: { color: '#D97706' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({
        title: "Payment Initialization Failed",
        description: "Could not start Razorpay checkout.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isBuyNow && !currentBuyNowItem) return null;
  if (!isBuyNow && state.items.length === 0) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white">
              <h2 className="text-xl font-semibold text-amber-900 mb-6 flex items-center">
                <MapPin className="mr-2" size={20} />
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input type="text" name="fullName" value={shippingInfo.fullName} onChange={handleInputChange}
                      className="pl-10 w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange}
                      className="pl-10 w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                  </div>
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Email Address *</label>
                  <input type="email" name="email" value={shippingInfo.email} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Address *</label>
                  <textarea name="address" value={shippingInfo.address} onChange={handleInputChange} rows={3}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">City *</label>
                  <input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">State *</label>
                  <Select value={shippingInfo.state} onValueChange={handleStateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="telangana">Telangana</SelectItem>
                      <SelectItem value="andhrapradesh">AndhraPradesh</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="gujarat">Gujarat</SelectItem>
                      <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="west-bengal">West Bengal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">PIN Code *</label>
                  <input type="text" name="pincode" value={shippingInfo.pincode} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Landmark (Optional)</label>
                  <input type="text" name="landmark" value={shippingInfo.landmark} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
            </Card>

            {/* Payment */}
            <Card className="p-6 bg-white">
              <h2 className="text-xl font-semibold text-amber-900 mb-6 flex items-center">
                <CreditCard className="mr-2" size={20} /> Payment Method
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input type="radio" id="razorpay" name="payment" value="razorpay"
                    checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500" />
                  <label htmlFor="razorpay" className="flex items-center">
                    <span className="text-stone-700 font-medium">Razorpay</span>
                    <span className="ml-2 text-sm text-stone-500">(Credit/Debit Card, UPI, Net Banking)</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input type="radio" id="cod" name="payment" value="cod"
                    checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500" />
                  <label htmlFor="cod" className="flex items-center">
                    <span className="text-stone-700 font-medium">Cash on Delivery</span>
                    <span className="ml-2 text-sm text-stone-500">(Pay when furniture is delivered)</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-start">
                <Lock className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-700">Your payment information is secure and encrypted. We never store your card details.</p>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white sticky top-8">
              <h2 className="text-xl font-semibold text-amber-900 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {(isBuyNow && currentBuyNowItem ? [currentBuyNowItem] : state.items).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={`${API_BASE}${item.image}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h4 className="font-medium text-stone-900 text-sm">
                        {item.name}
                      </h4>

                      <p className="text-xs text-stone-600">
                        Qty: {item.quantity}
                      </p>

                      {item.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="text-sm font-medium text-amber-600">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping.toLocaleString()}`}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-amber-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <Button onClick={handlePlaceOrder} disabled={isProcessing || !validateForm()}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3" size="lg">
                {isProcessing ? 'Processing...' : `Place Order - ₹${total.toLocaleString()}`}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;