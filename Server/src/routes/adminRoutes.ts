import express from "express";
import { verifyToken } from "../middleware/authmiddleware";
import { verifyAdmin } from "../middleware/adminmiddleware";
import Order from "../models/Order";
import Product from "../models/Product";
import { upload } from "../utils/upload";

const router = express.Router();

/* =======================
   🔐 Admin Test Route
======================= */
router.get("/test", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Admin access granted ✅" });
});

/* =======================
   ➕ Add Product (WITH IMAGE + CUSTOM OPTIONS)
======================= */
router.post(
  "/products",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      let customizationOptions = {};

      if (req.body.customizationOptions) {
        customizationOptions = JSON.parse(req.body.customizationOptions);
      }

      const product = await Product.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        isInStock: req.body.isInStock,
        image: req.file
          ? `/uploads/products/${req.file.filename}`
          : "",
        customizationOptions, // ✅ FIX
      });

      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({
        message: "Failed to add product",
        error: err.message,
      });
    }
  }
);

/* =======================
   ✏️ Update Product (WITH CUSTOM OPTIONS)
======================= */
router.put(
  "/products/:id",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      let customizationOptions = {};

      if (req.body.customizationOptions) {
        customizationOptions = JSON.parse(req.body.customizationOptions);
      }

      const updateData: any = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        isInStock: req.body.isInStock,
        customizationOptions, // ✅ FIX
      };

      // ✅ Only update image if new one is uploaded
      if (req.file) {
        updateData.image = `/uploads/products/${req.file.filename}`;
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (err: any) {
      res.status(400).json({
        message: "Failed to update product",
        error: err.message,
      });
    }
  }
);

/* =======================
   ❌ Delete Product
======================= */
router.delete(
  "/products/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted" });
    } catch (err: any) {
      res.status(400).json({
        message: "Failed to delete product",
        error: err.message,
      });
    }
  }
);

/* =======================
   📦 Get All Products (Admin)
======================= */
router.get(
  "/products",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json(products);
    } catch (err: any) {
      res.status(500).json({
        message: "Failed to fetch products",
        error: err.message,
      });
    }
  }
);

/* =======================
   📊 Dashboard Stats
======================= */
router.get(
  "/dashboard-stats",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const totalOrders = await Order.countDocuments();

      const revenueAgg = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);

      const totalRevenue = revenueAgg[0]?.total || 0;

      const pendingOrders = await Order.countDocuments({
        status: { $ne: "Delivered" },
      });

      const totalProducts = await Product.countDocuments();

      res.json({
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalProducts,
      });
    } catch {
      res.status(500).json({
        message: "Failed to fetch dashboard stats",
      });
    }
  }
);

export default router;
