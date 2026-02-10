import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "../hooks/use-toast";
import axios from "../api/axios";

const API_BASE = import.meta.env.VITE_API_URL;

const Cart = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [collaborativeSession, setCollaborativeSession] = useState<string | null>(null);

  /**
   * 🔑 productId → full product object
   * Used ONLY for rendering extra details like description
   */
  const [productMap, setProductMap] = useState<Record<string, any>>({});

  /* ================= FETCH PRODUCT DETAILS ================= */
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const idsToFetch = state.items
          .map(item => item.productId)
          .filter(id => !productMap[id]);

        if (idsToFetch.length === 0) return;

        const responses = await Promise.all(
          idsToFetch.map(id => axios.get(`/api/products/${id}`))
        );

        const newMap: Record<string, any> = {};
        responses.forEach(res => {
          newMap[res.data._id] = res.data;
        });

        setProductMap(prev => ({ ...prev, ...newMap }));
      } catch (err) {
        console.error("Failed to fetch product details", err);
      }
    };

    if (state.items.length > 0) {
      fetchProductDetails();
    }
  }, [state.items, productMap]);

  /* ================= COLLAB SESSION ================= */
  useEffect(() => {
    const savedSession = localStorage.getItem("collaborativeSession");
    if (savedSession) setCollaborativeSession(savedSession);
  }, []);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string, name: string) => {
    removeItem(productId);
    toast({
      title: "Item Removed",
      description: `${name} has been removed from your cart.`,
    });
  };

  const startCollaborativeSession = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to start collaborative shopping.",
      });
      return;
    }

    const sessionId = `cart-${Date.now()}`;
    setCollaborativeSession(sessionId);
    localStorage.setItem("collaborativeSession", sessionId);

    const shareLink = `${window.location.origin}/collaborative-cart/${sessionId}`;
    navigator.clipboard.writeText(shareLink);

    toast({
      title: "Collaborative Shopping Started",
      description: "Share link copied to clipboard.",
    });
  };

  const subtotal = state.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18;
  const shipping = subtotal > 50000 ? 0 : 2000;
  const total = subtotal + tax + shipping;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <ShoppingBag size={64} className="mx-auto text-stone-300 mb-6" />
          <h2 className="text-2xl font-bold text-stone-700 mb-4">
            Your cart is empty
          </h2>
          <Link to="/products">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">Shopping Cart</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={startCollaborativeSession}>
              <Users size={16} className="mr-2" />
              Shop Together
            </Button>
            <Button variant="outline" className="text-red-600" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map(item => {
              const product = productMap[item.productId];

              return (
                <Card key={item.productId} className="p-6 bg-white">
                  <div className="flex gap-6">
                    <img
                      src={`${API_BASE}${item.image}`}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-amber-900">
                        {item.name}
                      </h3>

                      {product?.description && (
                        <p className="text-sm text-stone-600 mt-2 whitespace-pre-line">
                          {product.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus size={16} />
                          </Button>

                          <span className="font-medium">{item.quantity}</span>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-amber-600">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              handleRemoveItem(item.productId, item.name)
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* SUMMARY */}
          <div>
            <Card className="p-6 bg-white sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>

                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Link to={isAuthenticated ? "/checkout" : "/login"}>
                <Button className="w-full mt-6 bg-amber-600 hover:bg-amber-700">
                  Proceed to Checkout
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
