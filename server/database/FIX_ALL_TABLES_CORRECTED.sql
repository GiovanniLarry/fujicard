-- ============================================
-- CORRECTED DATABASE FIX SCRIPT
-- Run this in Supabase SQL Editor step by step
-- ============================================

-- Step 1: Add session_id column to carts table (if it doesn't exist)
-- This will show an error if the column already exists, which is fine
ALTER TABLE carts ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Step 2: Add session_id column to orders table (if it doesn't exist)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Step 3: Create indexes for performance (only if columns exist)
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Step 4: Ensure order_items table exists with proper structure
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

-- Step 5: Create indexes for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Step 6: Disable RLS for functionality
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Step 7: Verify tables and columns
SELECT 
  'carts' as table_name, 
  count(*) as column_count,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'carts' AND table_schema = 'public'
UNION ALL
SELECT 
  'cart_items', 
  count(*),
  string_agg(column_name, ', ' ORDER BY ordinal_position)
FROM information_schema.columns 
WHERE table_name = 'cart_items' AND table_schema = 'public'
UNION ALL
SELECT 
  'orders', 
  count(*),
  string_agg(column_name, ', ' ORDER BY ordinal_position)
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
UNION ALL
SELECT 
  'order_items', 
  count(*),
  string_agg(column_name, ', ' ORDER BY ordinal_position)
FROM information_schema.columns 
WHERE table_name = 'order_items' AND table_schema = 'public';
