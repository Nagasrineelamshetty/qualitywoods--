import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { toast } from "../hooks/use-toast";
import AddProductModal from "../components/admin/AddProductModal";
import axios from "../api/axios";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/admin/products");
        setProducts(res.data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    try {
      await axios.delete(`/api/admin/products/${productId}`);
      setProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );

      toast({
        title: "Product deleted",
        description: "Product removed successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      {/* 🔒 Constrained container */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-900">
            Product Management
          </h1>

          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => {
              setSelectedProduct(null);
              setShowAddModal(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products */}
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product._id}
                className="bg-white overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* 📸 Bigger image */}
                <img
                  src={`${API_BASE}${product.image}`}
                  alt={product.name}
                  className="w-full h-64 lg:h-72 object-cover"
                />

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-amber-900 leading-snug">
                      {product.name}
                    </h3>

                    <span
                      className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        product.isInStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isInStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <p className="text-sm text-stone-600">
                    {product.category}
                  </p>

                  <p className="font-bold text-amber-600 mb-3">
                    ₹{product.price.toLocaleString()}
                  </p>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAddModal(true);
                      }}
                    >
                      <Edit size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add / Edit Modal */}
        {showAddModal && (
          <AddProductModal
            product={selectedProduct}
            onClose={() => {
              setShowAddModal(false);
              setSelectedProduct(null);
            }}
            onProductSaved={(updatedProduct) => {
              setProducts((prev) => {
                const exists = prev.find(
                  (p) => p._id === updatedProduct._id
                );
                if (exists) {
                  return prev.map((p) =>
                    p._id === updatedProduct._id ? updatedProduct : p
                  );
                }
                return [updatedProduct, ...prev];
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
