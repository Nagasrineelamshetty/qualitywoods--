import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "../hooks/use-toast";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addItem, setBuyNowItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FETCH PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch {
        toast({ title: "Product not found", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6">Product not found</div>;

  // BUY NOW
  const handleBuyNow = () => {
    if (!user) {
      toast({ title: "Please login to continue", variant: "destructive" });
      navigate("/login", { state: { redirectTo: `/products/${id}` } });
      return;
    }

    setBuyNowItem({
      productId: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    navigate("/checkout?mode=buy-now");
  };

  // ADD TO CART
  const handleAddToCart = () => {
    addItem({
      productId:product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    toast({ title: "Added to cart!" });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={`${import.meta.env.VITE_API_URL}${product.image}`}
          alt={product.name}
          className="w-full md:w-1/2 rounded-lg object-cover"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-amber-900">
            {product.name}
          </h1>

          {/* ✅ Description = all specs */}
          <p className="text-stone-600 mb-6 whitespace-pre-line">
            {product.description}
          </p>

          <p className="text-xl font-semibold text-green-800 mb-6">
            ₹{product.price.toLocaleString()}
          </p>

          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="bg-stone-700 hover:bg-stone-800"
            >
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
