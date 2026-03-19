-- ============================================
-- COMPLETE DATABASE FIX SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Fix carts table - add session_id if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carts' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE carts ADD COLUMN session_id TEXT;
    RAISE NOTICE 'Added session_id column to carts table';
  ELSE
    RAISE NOTICE 'session_id column already exists in carts table';
  END IF;
END $$;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- 3. Ensure orders table has all required columns
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postcode TEXT,
  shipping_country TEXT,
  shipping_phone TEXT,
  shipping_email TEXT,
  shipping_first_name TEXT,
  shipping_last_name TEXT,
  payment_method TEXT DEFAULT 'card',
  currency TEXT DEFAULT 'GBP',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ensure order_items table exists
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 6. Disable RLS for functionality
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 7. Verify tables
SELECT 'carts' as table_name, count(*) as column_count FROM information_schema.columns WHERE table_name = 'carts'
UNION ALL
SELECT 'cart_items', count(*) FROM information_schema.columns WHERE table_name = 'cart_items'
UNION ALL
SELECT 'orders', count(*) FROM information_schema.columns WHERE table_name = 'orders'
UNION ALL
SELECT 'order_items', count(*) FROM information_schema.columns WHERE table_name = 'order_items';
