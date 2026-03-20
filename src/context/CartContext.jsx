import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], itemCount: 0, subtotal: '0.00' });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Generate session ID for guest cart
  useEffect(() => {
    if (!localStorage.getItem('sessionId') && !localStorage.getItem('token')) {
      localStorage.setItem('sessionId', `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      console.log('Adding to cart - Product ID:', productId, 'Quantity:', quantity);
      // Removed sync loader to maximize user interface snappiness

      const response = await cartAPI.add(productId, quantity);
      console.log('Add to cart response:', response);

      // Fetch UI cart updates asynchronously without blocking the "Added" loading completion
      fetchCart();
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      await cartAPI.update(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      await cartAPI.remove(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clear();
      await fetchCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
