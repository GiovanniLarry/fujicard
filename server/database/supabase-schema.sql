-- Fuji Card Market - Supabase Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE card_condition AS ENUM ('Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor', 'Sealed');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Categories Table (must be created BEFORE products due to foreign key)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  card_type VARCHAR(100),
  set_name VARCHAR(255),
  rarity VARCHAR(100),
  condition card_condition DEFAULT 'Mint',
  language VARCHAR(50) DEFAULT 'English',
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  promo BOOLEAN DEFAULT false,
  discount INTEGER DEFAULT 0,
  graded BOOLEAN DEFAULT false,
  grading_company VARCHAR(100),
  grade DECIMAL(3, 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses Table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United Kingdom',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carts Table
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(session_id)
);

-- Cart Items Table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  shipping_address_id UUID REFERENCES addresses(id),
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist Table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Wishlist Items Table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wishlist_id, product_id)
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_promo ON products(promo);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('pokemon', 'Pokemon Trading Card Game singles and sealed products'),
  ('yugioh', 'Yu-Gi-Oh! Trading Card Game singles and sealed products'),
  ('onepiece', 'One Piece Card Game singles and sealed products'),
  ('newarrivals', 'Latest cards from all games - Fresh stock!'),
  ('specialrare', 'Ultra-rare collectibles and graded gems - Investment grade cards!'),
  ('promo', 'Special discounted cards - Limited time offers!'),
  ('sealed', 'Factory sealed booster boxes, ETBs, and collections'),
  ('accessories', 'Sleeves, binders, deck boxes, and playing accessories');

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Products (Anyone can read, only authenticated users can modify)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE TO authenticated USING (true);

-- RLS Policies for Categories (Anyone can read)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);

-- RLS Policies for Users (Users can only view/modify their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT TO authenticated USING (auth.uid() = supabase_user_id OR true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = supabase_user_id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = supabase_user_id);

-- RLS Policies for Addresses (Users can only manage their own addresses)
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT TO authenticated WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

-- RLS Policies for Carts (Users can only manage their own cart)
CREATE POLICY "Users can view own cart" ON carts FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
CREATE POLICY "Users can update own cart" ON carts FOR UPDATE TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
CREATE POLICY "Guests can view own cart" ON carts FOR SELECT USING (session_id IS NOT NULL);
CREATE POLICY "Guests can update own cart" ON carts FOR UPDATE USING (session_id IS NOT NULL);

-- RLS Policies for Cart Items
CREATE POLICY "Users can view own cart items" ON cart_items FOR SELECT TO authenticated USING (cart_id IN (SELECT id FROM carts WHERE user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid())));
CREATE POLICY "Users can modify own cart items" ON cart_items FOR ALL TO authenticated USING (cart_id IN (SELECT id FROM carts WHERE user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid())));
CREATE POLICY "Guests can view own cart items" ON cart_items FOR SELECT USING (cart_id IN (SELECT id FROM carts WHERE session_id IS NOT NULL));
CREATE POLICY "Guests can modify own cart items" ON cart_items FOR ALL USING (cart_id IN (SELECT id FROM carts WHERE session_id IS NOT NULL));

-- RLS Policies for Orders (Users can only view their own orders)
CREATE POLICY "Users can view own orders" ON orders FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT TO authenticated WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

-- RLS Policies for Order Items
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid())));

-- RLS Policies for Wishlists
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
CREATE POLICY "Users can modify own wishlist" ON wishlists FOR ALL TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

-- RLS Policies for Wishlist Items
CREATE POLICY "Users can view own wishlist items" ON wishlist_items FOR SELECT TO authenticated USING (wishlist_id IN (SELECT id FROM wishlists WHERE user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid())));
CREATE POLICY "Users can modify own wishlist items" ON wishlist_items FOR ALL TO authenticated USING (wishlist_id IN (SELECT id FROM wishlists WHERE user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid())));

-- RLS Policies for Reviews (Anyone can read, authenticated users can write)
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE TO authenticated USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));
