import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";

/* ================= TYPES ================= */

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
  category?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  buyNowItem: CartItem | null;
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_BUY_NOW_ITEM"; payload: CartItem }
  | { type: "CLEAR_BUY_NOW_ITEM" };

const GUEST_CART_KEY = "guest_cart";

/* ================= REDUCER ================= */

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let items: CartItem[];

  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "LOAD_CART":
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        ),
        loading: false,
      };

    case "ADD_ITEM": {
      const existing = state.items.find(
        i => i.productId === action.payload.productId
      );

      items = existing
        ? state.items.map(i =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          )
        : [...state.items, action.payload];
      break;
    }

    case "REMOVE_ITEM":
      items = state.items.filter(i => i.productId !== action.payload);
      break;

    case "UPDATE_QUANTITY":
      items = state.items.map(i =>
        i.productId === action.payload.productId
          ? { ...i, quantity: action.payload.quantity }
          : i
      );
      break;

    case "CLEAR_CART":
      return { ...state, items: [], total: 0, loading: false };

    case "SET_BUY_NOW_ITEM":
      sessionStorage.setItem("buyNowItem", JSON.stringify(action.payload));
      return { ...state, buyNowItem: action.payload };

    case "CLEAR_BUY_NOW_ITEM":
      sessionStorage.removeItem("buyNowItem");
      return { ...state, buyNowItem: null };

    default:
      return state;
  }

  return {
    ...state,
    items,
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    loading: false,
  };
};

/* ================= CONTEXT ================= */

const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    loading: true,
    buyNowItem: sessionStorage.getItem("buyNowItem")
      ? JSON.parse(sessionStorage.getItem("buyNowItem")!)
      : null,
  });

  const { user } = useAuth();

  /* ================= LOAD CART ================= */

  useEffect(() => {
    const loadCart = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      // Guest → localStorage
      if (!user?._id) {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        dispatch({
          type: "LOAD_CART",
          payload: stored ? JSON.parse(stored) : [],
        });
        return;
      }

      // Logged-in → backend
      try {
        const res = await axios.get("/api/cart");

        const items: CartItem[] = (res.data.items || []).map((i: any) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          image: i.image,
          quantity: i.quantity,
        }));

        dispatch({ type: "LOAD_CART", payload: items });
      } catch (err) {
        console.error("Failed to load cart", err);
        dispatch({ type: "LOAD_CART", payload: [] });
      }
    };

    loadCart();
  }, [user?._id]);

  /* ================= PERSIST CART ================= */

  const persistCart = async (items: CartItem[]) => {
    try {
      await axios.post("/api/cart", {
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          image: i.image,
          quantity: i.quantity,
          customizations: {},
        })),
      });
    } catch (err) {
      console.error("Cart persistence failed", err);
    }
  };

  /* ================= PROVIDER API ================= */

  return (
    <CartContext.Provider
      value={{
        state,

        addItem: (item: CartItem) => {
          const updated = (() => {
            const existing = state.items.find(
              i => i.productId === item.productId
            );
            return existing
              ? state.items.map(i =>
                  i.productId === item.productId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                )
              : [...state.items, item];
          })();

          dispatch({ type: "ADD_ITEM", payload: item });
          persistCart(updated);
        },

        removeItem: (productId: string) => {
          const updated = state.items.filter(
            i => i.productId !== productId
          );
          dispatch({ type: "REMOVE_ITEM", payload: productId });
          persistCart(updated);
        },

        updateQuantity: (productId: string, quantity: number) => {
          const updated = state.items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          );
          dispatch({
            type: "UPDATE_QUANTITY",
            payload: { productId, quantity },
          });
          persistCart(updated);
        },

        clearCart: () => {
          dispatch({ type: "CLEAR_CART" });
          persistCart([]);
        },

        setBuyNowItem: (item: CartItem) =>
          dispatch({ type: "SET_BUY_NOW_ITEM", payload: item }),

        clearBuyNowItem: () =>
          dispatch({ type: "CLEAR_BUY_NOW_ITEM" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
