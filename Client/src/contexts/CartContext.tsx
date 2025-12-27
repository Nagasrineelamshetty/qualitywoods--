import React, { createContext, useContext, useEffect, useReducer } from "react";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";

interface CartItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  buyNowItem: CartItem | null;
}

type CartAction =
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_BUY_NOW_ITEM"; payload: CartItem }
  | { type: "CLEAR_BUY_NOW_ITEM" };

const GUEST_CART_KEY = "guest_cart";

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let items: CartItem[];

  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "LOAD_CART":
      items = action.payload;
      return {
        ...state,
        items,
        total: items.reduce((s, i) => s + i.price * i.quantity, 0),
        loading: false,
        buyNowItem: state.buyNowItem,
      };

    case "ADD_ITEM": {
      const existing = state.items.find(i => i.id === action.payload.id);
      items = existing
        ? state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          )
        : [...state.items, action.payload];
      break;
    }

    case "REMOVE_ITEM":
      items = state.items.filter(i => i.id !== action.payload);
      break;

    case "UPDATE_QUANTITY":
      items = state.items.map(i =>
        i.id === action.payload.id
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

const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    loading: true,
    buyNowItem: sessionStorage.getItem("buyNowItem")
    ? JSON.parse(sessionStorage.getItem("buyNowItem")!)
    : null,
  });

  const { user } = useAuth();

  /* LOAD CART (guest vs logged-in separation) */
  useEffect(() => {
    if (!user?._id) {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      dispatch({
        type: "LOAD_CART",
        payload: stored ? JSON.parse(stored) : [],
      });
    } else {
      // reset cart on login, backend will sync next
      dispatch({
        type: "LOAD_CART",
        payload: [], // cart items only
  });
    }
  }, [user?._id]);

  /* SAVE CART (EMPTY CARTS INCLUDED ✅) */
  useEffect(() => {
    if (state.loading) return;

    // Guest user → localStorage
    if (!user?._id) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(state.items));
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const payload = state.items.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      category: i.category,
      price: i.price,
      image: i.image,
      quantity: i.quantity,
    }));

    const t = setTimeout(async () => {
      try {
        await axios.post(
          "/api/cart",
          { items: payload }, // empty array allowed
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.error("Cart save failed", e);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [state.items, user?._id, state.loading]);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem: (item: CartItem) =>
          dispatch({ type: "ADD_ITEM", payload: item }),
        removeItem: (id: string) =>
          dispatch({ type: "REMOVE_ITEM", payload: id }),
        updateQuantity: (id: string, quantity: number) =>
          dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
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
