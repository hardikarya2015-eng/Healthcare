-- =============================================
-- PharmEasy-style Healthcare Ecommerce Schema
-- Run this in your Supabase SQL editor
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USERS
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADDRESSES
-- =============================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  phone TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  brand TEXT,
  manufacturer TEXT,
  dosage TEXT,                        -- e.g. "500mg", "10ml"
  price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  discounted_price DECIMAL(10,2) GENERATED ALWAYS AS
    (ROUND(price * (1 - discount_percent::DECIMAL / 100), 2)) STORED,
  image_url TEXT,
  prescription_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVENTORY
-- =============================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CARTS
-- =============================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CART ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- =============================================
-- PRESCRIPTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed','confirmed','packed','shipped','delivered','cancelled','returned')),
  payment_method TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod','online','wallet')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,         -- snapshot at time of order
  product_image TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions(user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile + cart on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-create empty cart
  INSERT INTO public.carts (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users: own row" ON users FOR ALL USING (auth.uid() = id);

-- Addresses
CREATE POLICY "Addresses: own rows" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Products: public read
CREATE POLICY "Products: public read" ON products FOR SELECT USING (true);

-- Inventory: public read
CREATE POLICY "Inventory: public read" ON inventory FOR SELECT USING (true);

-- Categories: public read
CREATE POLICY "Categories: public read" ON categories FOR SELECT USING (true);

-- Carts: own cart
CREATE POLICY "Carts: own row" ON carts FOR ALL USING (auth.uid() = user_id);

-- Cart items: own cart items
CREATE POLICY "Cart items: own cart" ON cart_items FOR ALL
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

-- Orders: own orders
CREATE POLICY "Orders: own rows" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Orders: customer insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: readable if own order
CREATE POLICY "Order items: own order" ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Prescriptions: own rows
CREATE POLICY "Prescriptions: own rows" ON prescriptions FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Medicines',         'medicines',          'Prescription & OTC medicines',        1),
  ('Vitamins & Supplements', 'vitamins',      'Health supplements and vitamins',     2),
  ('Personal Care',     'personal-care',      'Skincare, haircare and hygiene',      3),
  ('Baby & Mom',        'baby-mom',           'Baby care and maternity products',    4),
  ('Devices & Monitors','devices',            'BP monitors, glucometers and more',   5),
  ('Ayurveda',          'ayurveda',           'Herbal and Ayurvedic products',       6),
  ('Homeopathy',        'homeopathy',         'Homeopathic medicines',               7),
  ('Covid Essentials',  'covid-essentials',   'Masks, sanitizers and test kits',     8)
ON CONFLICT (slug) DO NOTHING;

-- Sample products
INSERT INTO products (category_id, name, slug, description, brand, manufacturer, price, discount_percent, prescription_required, tags) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'medicines'),
    'Paracetamol 500mg Tablet',
    'paracetamol-500mg',
    'Used for relief of mild to moderate pain and reduction of fever.',
    'GSK', 'GlaxoSmithKline',
    25.00, 10, false,
    ARRAY['fever', 'pain relief', 'paracetamol']
  ),
  (
    (SELECT id FROM categories WHERE slug = 'vitamins'),
    'Vitamin C 1000mg Effervescent',
    'vitamin-c-1000mg',
    'Supports immune system and antioxidant protection.',
    'Limcee', 'Abbott',
    180.00, 15, false,
    ARRAY['vitamin c', 'immunity', 'effervescent']
  ),
  (
    (SELECT id FROM categories WHERE slug = 'medicines'),
    'Azithromycin 500mg Tablet',
    'azithromycin-500mg',
    'Antibiotic used for bacterial infections.',
    'Zithromax', 'Pfizer',
    95.00, 5, true,
    ARRAY['antibiotic', 'infection', 'azithromycin']
  ),
  (
    (SELECT id FROM categories WHERE slug = 'devices'),
    'Digital Blood Pressure Monitor',
    'bp-monitor-digital',
    'Automatic upper arm blood pressure monitor with memory function.',
    'Omron', 'Omron Healthcare',
    1899.00, 20, false,
    ARRAY['bp monitor', 'blood pressure', 'device']
  ),
  (
    (SELECT id FROM categories WHERE slug = 'vitamins'),
    'Omega-3 Fish Oil 1000mg',
    'omega3-fish-oil-1000mg',
    'Supports heart health, brain function and joint flexibility.',
    'HealthKart', 'Nutraceuticals Ltd',
    450.00, 25, false,
    ARRAY['omega3', 'fish oil', 'heart health']
  )
ON CONFLICT (slug) DO NOTHING;

-- Seed inventory for sample products
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 100, 10 FROM products
ON CONFLICT (product_id) DO NOTHING;
