import express from "express";
import Product from "../models/Product";

const router = express.Router();

/* =========================
   🔥 CACHE STRUCTURE
========================= */

let cachedProducts: any = null;
let productsCacheTime: number = 0;

const productByIdCache: Record<string, any> = {};
const productByIdCacheTime: Record<string, number> = {};

const CACHE_DURATION = 60 * 1000; // 1 minute

/* =========================
   📦 GET ALL PRODUCTS
========================= */

router.get("/", async (req, res) => {
  try {
    if (
      cachedProducts &&
      Date.now() - productsCacheTime < CACHE_DURATION
    ) {
      return res.json(cachedProducts);
    }

    const products = await Product.find()
      .select("name price image category isInStock")
      .sort({ createdAt: -1 })
      .lean();

    cachedProducts = products;
    productsCacheTime = Date.now();

    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/* =========================
   📦 GET PRODUCT BY ID
========================= */

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (
      productByIdCache[id] &&
      Date.now() - productByIdCacheTime[id] < CACHE_DURATION
    ) {
      return res.json(productByIdCache[id]);
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    productByIdCache[id] = product;
    productByIdCacheTime[id] = Date.now();

    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid product id" });
  }
});

/* =========================
   🔥 CACHE INVALIDATION FUNCTION
========================= */

export const invalidateProductCache = () => {
  cachedProducts = null;
  productsCacheTime = 0;

  Object.keys(productByIdCache).forEach((key) => {
    delete productByIdCache[key];
  });

  Object.keys(productByIdCacheTime).forEach((key) => {
    delete productByIdCacheTime[key];
  });
};

export default router;