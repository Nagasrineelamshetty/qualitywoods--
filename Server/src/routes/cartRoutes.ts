import express from "express";
import Cart from "../models/Cart";
import { verifyToken, AuthenticatedRequest } from "../middleware/authmiddleware";

const router = express.Router();

/* ======================================================
   SAVE / UPDATE CART
   ====================================================== */

router.post("/", verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { items } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array" });
    }

    /* ✅ Validate cart item shape */
    for (const item of items) {
      if (
        typeof item.productId !== "string" ||
        typeof item.name !== "string" ||
        typeof item.image !== "string" ||
        typeof item.price !== "number" ||
        typeof item.quantity !== "number"
      ) {
        return res.status(400).json({
          error: "Invalid cart item format",
        });
      }
    }

    /* ✅ Save or replace cart (idempotent) */
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { items },
      { new: true, upsert: true }
    );

    return res.status(200).json(updatedCart);
  } catch (err) {
    console.error("❌ Error saving cart:", err);
    return res.status(500).json({ error: "Failed to save cart" });
  }
});

/* ======================================================
   FETCH CART
   ====================================================== */

router.get("/", verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const cart = await Cart.findOne({ userId });

    return res.status(200).json(cart || { items: [] });
  } catch (err) {
    console.error("❌ Error fetching cart:", err);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
});

export default router;
