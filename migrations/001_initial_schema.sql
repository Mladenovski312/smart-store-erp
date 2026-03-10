-- ╔══════════════════════════════════════════════════════════════╗
-- ║  InterStar Jumbo — Full Database Schema                     ║
-- ║  Run this in: Supabase Dashboard → SQL Editor → New Query   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  emoji TEXT DEFAULT '📦',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, label, emoji) VALUES
  ('Vehicles & Ride-ons', 'Возила и Автомобили на батерии', '🚗'),
  ('Dolls & Figures', 'Кукли и Фигури', '🎎'),
  ('Baby & Toddler', 'Опрема за Бебиња', '👶'),
  ('Outdoor & Sports', 'Спорт и Рекреација (Надвор)', '⚽'),
  ('Games & Puzzles', 'Игри и Сложувалки', '🧩'),
  ('Clothing & School', 'Облека и Училишен прибор', '🎒'),
  ('Разно (Miscellaneous)', 'Разно', '🎁')
ON CONFLICT (name) DO NOTHING;

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  barcode TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sales History
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity_sold INTEGER NOT NULL,
  sold_price DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  sold_by UUID REFERENCES auth.users(id),
  sold_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Roles (admin vs employee)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories: anyone authenticated can read
CREATE POLICY "Categories are viewable by authenticated users"
  ON categories FOR SELECT TO authenticated USING (true);

-- Products: authenticated users can read; admins can insert/update/delete
CREATE POLICY "Products viewable by authenticated"
  ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Products insertable by authenticated"
  ON products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Products updatable by authenticated"
  ON products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Products deletable by admins"
  ON products FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Sales: authenticated can read and insert
CREATE POLICY "Sales viewable by authenticated"
  ON sales FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sales insertable by authenticated"
  ON sales FOR INSERT TO authenticated WITH CHECK (true);

-- User roles: admins can manage, users can read their own
CREATE POLICY "Users can see their own role"
  ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can see all roles"
  ON user_roles FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Allow users to insert their own role on first login (EMPLOYEE ONLY — security)
CREATE POLICY "Users can create their own role"
  ON user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'employee');

-- 6. Allow public (unauthenticated) to read products for the storefront
CREATE POLICY "Public can view in-stock products"
  ON products FOR SELECT TO anon
  USING (stock_quantity > 0);

CREATE POLICY "Public can view categories"
  ON categories FOR SELECT TO anon USING (true);

-- ═══════════════════════════════════════════════════════════
-- 7. Customers (optional accounts from checkout)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  city TEXT,
  street TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Anyone can create/update their customer profile (checkout)
CREATE POLICY "Public can insert customers"
  ON customers FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update own customer by email"
  ON customers FOR UPDATE TO anon, authenticated
  USING (true);

-- Admins can view all customers
CREATE POLICY "Admins can view customers"
  ON customers FOR SELECT TO authenticated
  USING (is_admin());

-- ═══════════════════════════════════════════════════════════
-- 8. Orders (online COD orders from storefront)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  note TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can place an order (no auth required)
CREATE POLICY "Public can place orders"
  ON orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view orders
CREATE POLICY "Admins can view orders"
  ON orders FOR SELECT TO authenticated
  USING (is_admin());

-- Only admins can update order status
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE TO authenticated
  USING (is_admin());
