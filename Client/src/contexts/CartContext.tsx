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

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let items: CartItem[];

  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'LOAD_CART':
      items = action.payload;
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { ...state, items, total, loading: false };

    case 'ADD_ITEM':
      const existing = state.items.find(item => item.id === action.payload.id);
      items = existing
        ? state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.items, action.payload];
      break;

    case 'REMOVE_ITEM':
      items = state.items.filter(item => item.id !== action.payload);
      break;

    case 'UPDATE_QUANTITY':
      items = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { ...state, items, total, loading: false };
};

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setBuyNowItem: (item: CartItem) => void;
  clearBuyNowItem: () => void;
} | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    loading: true,
    buyNowItem: null,
  });

  const { user } = useAuth();

  // ----------------- Load cart from DB -----------------
  useEffect(() => {
    const loadCart = async () => {
      if (!user?._id) return;

      const token = localStorage.getItem('accessToken');
      if (!token) return;

      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const res = await axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const dbItems = res.data?.items || [];
        const loadedItems = dbItems.map((item: any) => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          customizations: item.customizations,
        }));

        dispatch({ type: 'LOAD_CART', payload: loadedItems });
        console.log('🔁 Loaded from DB:', loadedItems);
      } catch (err) {
        console.error('❌ Error loading cart from DB', err);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const timeout = setTimeout(loadCart, 100);
    return () => clearTimeout(timeout);
  }, [user?._id]);

  // ----------------- Auto-save cart -----------------
  useEffect(() => {
    if (!user?._id) return;
    if (state.items.length === 0) return; // prevent overwriting DB with empty cart

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const debounceSave = setTimeout(async () => {
      const payload = state.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        customizations: item.customizations,
      }));

      try {
        await axios.post('/api/cart', { items: payload }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('🛠 Cart auto-saved to DB:', payload);
      } catch (err) {
        console.error('❌ Auto-save failed:', err);
      }
    }, 500);

    return () => clearTimeout(debounceSave);
  }, [state.items, user?._id]);

  // ----------------- Buy Now handlers -----------------
  const setBuyNowItem = (item: CartItem) => {
    dispatch({ type: 'SET_BUY_NOW_ITEM', payload: item });
    localStorage.setItem('buyNowItem', JSON.stringify(item));
  };

  const clearBuyNowItem = () => {
    dispatch({ type: 'CLEAR_BUY_NOW_ITEM' });
    localStorage.removeItem('buyNowItem');
  };

  // ----------------- Cart actions -----------------
  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setBuyNowItem,
        clearBuyNowItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('🛒 useCart must be used within a CartProvider');
  return context;
};
