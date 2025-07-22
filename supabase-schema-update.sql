-- Add ID columns and update primary keys for all tables
-- This script should be run on your existing Supabase database

-- STEP 1: Drop all foreign key constraints first
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_serial_fkey;
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_order_name_fkey;

-- STEP 2: Add ID columns to all tables (but don't make them primary keys yet)
ALTER TABLE serial_manifest ADD COLUMN id SERIAL;
ALTER TABLE orders ADD COLUMN id SERIAL;
ALTER TABLE devices ADD COLUMN id SERIAL;

-- STEP 3: Drop existing primary key constraints and create new ones with ID
ALTER TABLE serial_manifest 
  DROP CONSTRAINT serial_manifest_pkey,
  ADD CONSTRAINT serial_manifest_pkey PRIMARY KEY (id),
  ADD CONSTRAINT serial_manifest_serial_unique UNIQUE (serial);

ALTER TABLE orders 
  DROP CONSTRAINT orders_pkey,
  ADD CONSTRAINT orders_pkey PRIMARY KEY (id),
  ADD CONSTRAINT orders_order_name_unique UNIQUE (order_name);

ALTER TABLE devices 
  DROP CONSTRAINT devices_pkey,
  ADD CONSTRAINT devices_pkey PRIMARY KEY (id),
  ADD CONSTRAINT devices_serial_unique UNIQUE (serial);

-- STEP 4: Add the new order_id column to devices and populate it
ALTER TABLE devices ADD COLUMN order_id INTEGER;

-- Populate the order_id based on order_name (if order_name exists)
UPDATE devices 
SET order_id = orders.id 
FROM orders 
WHERE devices.order_name = orders.order_name;

-- STEP 5: Drop the old order_name column and add the new foreign key
ALTER TABLE devices DROP COLUMN IF EXISTS order_name;
ALTER TABLE devices ADD CONSTRAINT devices_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- STEP 6: Update indexes (drop old ones, create new ones if needed)
DROP INDEX IF EXISTS idx_serial_manifest_serial;
DROP INDEX IF EXISTS idx_orders_order_name;
DROP INDEX IF EXISTS idx_devices_serial;
DROP INDEX IF EXISTS idx_devices_customer;
DROP INDEX IF EXISTS idx_devices_order_name;

-- Create new indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_serial_manifest_serial ON serial_manifest(serial);
CREATE INDEX IF NOT EXISTS idx_serial_manifest_sku ON serial_manifest(sku);
CREATE INDEX IF NOT EXISTS idx_orders_order_name ON orders(order_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer);
CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial);
CREATE INDEX IF NOT EXISTS idx_devices_customer ON devices(customer);
CREATE INDEX IF NOT EXISTS idx_devices_order_id ON devices(order_id);

-- Note: We're no longer using serial_manifest as a foreign key reference in devices
-- The application will handle joins between devices and serial_manifest using the serial field 