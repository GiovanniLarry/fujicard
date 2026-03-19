import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to get cart key (user id or session id)
const getCartKey = (req) => {
  return req.user ? req.user.id : req.headers['x-session-id'] || 'guest';
};

// Get cart
router.get('/', optionalAuth, async (req, res) => {
  try {
    const cartKey = getCartKey(req);
    console.log('Fetching cart for key:', cartKey);

    // Get or create cart for this user/session
    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('session_id', cartKey)
      .single();

    if (cartError || !cart) {
      console.log('Creating new cart for:', cartKey);
      // Create new cart for guest
      const { data: newCart, error: insertError } = await supabase
        .from('carts')
        .insert({ session_id: cartKey })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
          const { data: recoveredCart } = await supabase.from('carts').select('*').eq('session_id', cartKey).single();
          cart = recoveredCart;
        } else {
          console.error('Failed to create cart:', insertError);
          throw insertError;
        }
      } else {
        cart = newCart;
        console.log('New cart created:', cart.id);
      }
    } else {
      console.log('Existing cart found:', cart.id);
    }

    // Get cart items with product details
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          stock
        )
      `)
      .eq('cart_id', cart.id);

    if (itemsError) {
      console.error('Failed to fetch cart items:', itemsError);
      throw itemsError;
    }

    const populatedItems = cartItems?.map(item => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      product: item.products
    })) || [];

    const subtotal = populatedItems.reduce((sum, item) => {
      return sum + ((item.product?.price || 0) * item.quantity);
    }, 0);

    res.json({
      items: populatedItems,
      itemCount: populatedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: subtotal.toFixed(2),
      updatedAt: cart.updated_at
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post('/add', optionalAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const cartKey = getCartKey(req);

    console.log('Add to cart request - Product:', productId, 'Qty:', quantity, 'User:', cartKey);

    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    // Parallelize product stock check and cart lookup for 2x performance
    const [productRes, cartRes] = await Promise.all([
      supabase.from('products').select('id, stock, price').eq('id', productId).single(),
      supabase.from('carts').select('*').eq('session_id', cartKey).single()
    ]);

    const { data: product, error: productError } = productRes;
    let { data: cart, error: cartError } = cartRes;

    if (productError || !product) {
      console.error('Product not found:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    if (cartError || !cart) {
      console.log('Creating cart for add to cart...');
      const { data: newCart, error: insertError } = await supabase
        .from('carts')
        .insert({ session_id: cartKey })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
          const { data: recoveredCart } = await supabase.from('carts').select('*').eq('session_id', cartKey).single();
          cart = recoveredCart;
        } else {
          console.error('Failed to create cart:', insertError);
          throw insertError;
        }
      } else {
        cart = newCart;
        console.log('Cart created:', cart.id);
      }
    } else {
      console.log('Using existing cart:', cart.id);
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ error: 'Cannot add more than available stock' });
      }

      await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', existingItem.id);

      console.log('Updated existing item in cart');
    } else {
      const { error: insertItemError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          quantity: quantity
        });

      if (insertItemError) {
        console.error('Failed to add item to cart:', insertItemError);
        throw insertItemError;
      }
      console.log('Added new item to cart');
    }

    res.json({ success: true, message: 'Added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update cart item quantity
router.put('/update/:itemId', optionalAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    // Get cart item
    const { data: item } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (stock)
      `)
      .eq('id', itemId)
      .single();

    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item
      await supabase.from('cart_items').delete().eq('id', itemId);
    } else if (quantity > item.products.stock) {
      return res.status(400).json({ error: 'Not enough stock available' });
    } else {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', itemId);
    }

    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/remove/:itemId', optionalAuth, async (req, res) => {
  try {
    const { itemId } = req.params;

    await supabase.from('cart_items').delete().eq('id', itemId);

    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    const cartKey = getCartKey(req);

    // Get cart
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('session_id', cartKey)
      .single();

    if (cart) {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
