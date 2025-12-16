
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import axios from '../api/axios';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customizations: {
    wood?: string;
    finish?: string;
    dimensions?: string;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  buyNowItem: CartItem | null;
}

type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_BUY_NOW_ITEM'; payload: CartItem }
  | { type: 'CLEAR_BUY_NOW_ITEM' };

const GUEST_CART_KEY = 'guest_cart';

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let items: CartItem[];

  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'LOAD_CART':
      items = action.payload;
      return {
        ...state,
        items,
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        loading: false,
      };

    case 'ADD_ITEM': {
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

    case 'REMOVE_ITEM':
      items = state.items.filter(i => i.id !== action.payload);
      break;

    case 'UPDATE_QUANTITY':
      items = state.items.map(i =>
        i.id === action.payload.id
          ? { ...i, quantity: action.payload.quantity }
          : i
      );
      break;

    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, loading: false };

    case 'SET_BUY_NOW_ITEM':
      return { ...state, buyNowItem: action.payload };

    case 'CLEAR_BUY_NOW_ITEM':
      return { ...state, buyNowItem: null };

    default:
      return state;
  }

  return {
    ...state,
    items,
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    loading: false,
  };
};

const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    loading: true,
    buyNowItem: null,
  });

  const { user } = useAuth();

  /* =========================
     LOAD CART ON APP START
  ========================= */
  useEffect(() => {
    // Guest cart
    if (!user?._id) {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(stored) });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [user?._id]);

  /* =========================
     LOAD + MERGE CART AFTER LOGIN
  ========================= */
  useEffect(() => {
    if (!user?._id) return;

    const loadAndMerge = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const guestCart: CartItem[] = JSON.parse(
        localStorage.getItem(GUEST_CART_KEY) || '[]'
      );

      try {
        const res = await axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const dbItems: CartItem[] =
          res.data?.items?.map((item: any) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            customizations: item.customizations,
          })) || [];

        // Merge carts
        const merged = [...dbItems];
        guestCart.forEach(g => {
          const match = merged.find(i => i.id === g.id);
          match
            ? (match.quantity += g.quantity)
            : merged.push(g);
        });

        dispatch({ type: 'LOAD_CART', payload: merged });
        localStorage.removeItem(GUEST_CART_KEY);
      } catch (err) {
        console.error('❌ Cart load/merge failed', err);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadAndMerge();
  }, [user?._id]);

  /* =========================
     SAVE CART (GUEST or USER)
  ========================= */
  useEffect(() => {
    if (state.loading) return;

    // Guest save
    if (!user?._id) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(state.items));
      return;
    }

    // User save (DB)
    if (state.items.length === 0) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const payload = state.items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      customizations: item.customizations,
    }));

    const timeout = setTimeout(async () => {
      try {
        await axios.post('/api/cart', { items: payload }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('❌ Auto-save failed', err);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [state.items, user?._id, state.loading]);

  /* =========================
     BUY NOW
  ========================= */
  const setBuyNowItem = (item: CartItem) => {
    dispatch({ type: 'SET_BUY_NOW_ITEM', payload: item });
    localStorage.setItem('buyNowItem', JSON.stringify(item));
  };

  const clearBuyNowItem = () => {
    dispatch({ type: 'CLEAR_BUY_NOW_ITEM' });
    localStorage.removeItem('buyNowItem');
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem: (item: CartItem) =>
          dispatch({ type: 'ADD_ITEM', payload: item }),
        removeItem: (id: string) =>
          dispatch({ type: 'REMOVE_ITEM', payload: id }),
        updateQuantity: (id: string, quantity: number) =>
          dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
        setBuyNowItem,
        clearBuyNowItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
