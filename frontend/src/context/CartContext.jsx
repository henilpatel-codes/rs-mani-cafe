// context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'rs_mani_cart';

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (savedCart) {
      return JSON.parse(savedCart);
    }

    return { items: [] };
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return { items: [] };
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.payload._id);

      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i._id === action.payload._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i._id !== action.payload)
      };

    case 'UPDATE_QTY': {
      if (action.payload.qty <= 0) {
        return {
          ...state,
          items: state.items.filter(i => i._id !== action.payload.id)
        };
      }

      return {
        ...state,
        items: state.items.map(i =>
          i._id === action.payload.id
            ? { ...i, quantity: action.payload.qty }
            : i
        )
      };
    }

    case 'CLEAR':
      return { items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, getInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [state]);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        subtotal,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);