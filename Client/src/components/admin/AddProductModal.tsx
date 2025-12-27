import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "../../hooks/use-toast";

type Props = {
  onClose: () => void;
  onProductSaved: (product: any) => void;
  product?: any;
};

const AddProductModal = ({ onClose, onProductSaved, product }: Props) => {
  const isEditMode = Boolean(product);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    isInStock: true,
    image: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(null);

  // ✅ Pre-fill form in edit mode
  useEffect(() => {
    if (isEditMode && product) {
      setForm({
        name: product.name,
        category: product.category,
        price: String(product.price),
        description: product.description,
        isInStock: product.isInStock,
        image: null,
      });

      if (product.image) {
        setPreview(`${import.meta.env.VITE_API_URL}${product.image}`);
      }
    }
  }, [isEditMode, product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!token) throw new Error("No token");

      const url = isEditMode
        ? `${import.meta.env.VITE_API_URL}/api/admin/products/${product._id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/products`;

      const method = isEditMode ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("isInStock", String(form.isInStock));

      if (form.image) {
        formData.append("image", form.image);
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      onProductSaved(data);

      toast({
        title: isEditMode ? "Product updated" : "Product added",
        description: "Saved successfully",
      });

      onClose();
    } catch {
      toast({
        title: "Error",
        description: isEditMode
          ? "Failed to update product"
          : "Failed to add product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-6 bg-white space-y-4">
        <h2 className="text-xl font-bold text-amber-900">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h2>

        <input
          name="name"
          placeholder="Product Name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          className="w-full border p-2 rounded"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={handleChange}
        />

        {/* 📷 Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setForm((prev) => ({ ...prev, image: file }));
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded border"
          />
        )}

        <textarea
          name="description"
          placeholder="Description (include wood, size, finish here)"
          className="w-full border p-2 rounded"
          rows={4}
          value={form.description}
          onChange={handleChange}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isInStock}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isInStock: e.target.checked }))
            }
          />
          In Stock
        </label>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleSubmit}
          >
            {isEditMode ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddProductModal;
