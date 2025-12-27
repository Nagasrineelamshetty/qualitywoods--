import express from "express";
import Product from "../models/Product";

const router = express.Router();

// ✅ PUBLIC: Get ALL products (user product listing)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ✅ PUBLIC: Get SINGLE product by ID (Product details page)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid product id" });
  }
});

export default router;
