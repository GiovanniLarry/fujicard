-- ============================================
-- FIX RLS ON ADMIN RESOURCES SCRIPT
-- ============================================

-- Since the backend uses a custom JWT secret and not the native Supabase Auth JWT, 
-- Supabase automatically blocks all INSERT/UPDATE/DELETE actions performed by the API on protected tables.

-- Disable RLS on the products and categories tables to allow the Admin Dashboard 
-- to save changes, add new cards, and modify stock.

ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- If you intend to manage orders later via the admin dashboard:
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
