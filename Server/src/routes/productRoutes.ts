import express from "express";
import Product from "../models/Product";

const router = express.Router();

// 🔥 In-memory cache variables
let cachedProducts: any = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

// ✅ PUBLIC: Get ALL products (user product listing)
router.get("/", async (req, res) => {
  try {
    // ✅ If cache exists and not expired → return cached data
    if (cachedProducts && Date.now() - cacheTime < CACHE_DURATION) {
      return res.json(cachedProducts);
    }

    const products = await Product.find()
      .select("name price image category isInStock") 
      .sort({ createdAt: -1 })
      .lean();

    // 🔥 Store in cache
    cachedProducts = products;
    cacheTime = Date.now();

    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ✅ PUBLIC: Get SINGLE product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid product id" });
  }
});

export default router;