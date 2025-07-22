-- SIMPLIFIED MIGRATION: Add ID columns and update primary keys
-- This script should be run on your existing Supabase database

-- STEP 1: Drop all foreign key constraints first
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_serial_fkey;
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_order_name_fkey;

-- STEP 2: Add ID columns to all tables (but don't make them primary keys yet)
ALTER TABLE serial_manifest ADD COLUMN IF NOT EXISTS id SERIAL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS id SERIAL;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS id SERIAL;

-- STEP 3: Drop existing primary key constraints and create new ones with ID
ALTER TABLE serial_manifest 
  DROP CONSTRAINT IF EXISTS serial_manifest_pkey,
  ADD CONSTRAINT serial_manifest_pkey PRIMARY KEY (id),
  ADD CONSTRAINT serial_manifest_serial_unique UNIQUE (serial);

ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_pkey,
  ADD CONSTRAINT orders_pkey PRIMARY KEY (id),
  ADD CONSTRAINT orders_order_name_unique UNIQUE (order_name);

ALTER TABLE devices 
  DROP CONSTRAINT IF EXISTS devices_pkey,
  ADD CONSTRAINT devices_pkey PRIMARY KEY (id),
  ADD CONSTRAINT devices_serial_unique UNIQUE (serial);

-- STEP 4: Add the new order_id column to devices and populate it
ALTER TABLE devices ADD COLUMN IF NOT EXISTS order_id INTEGER;

-- Populate the order_id based on order_name (if order_name exists)
UPDATE devices 
SET order_id = orders.id 
FROM orders 
WHERE devices.order_name = orders.order_name 
AND devices.order_id IS NULL;

-- STEP 5: Drop the old order_name column and add the new foreign key
ALTER TABLE devices DROP COLUMN IF EXISTS order_name;
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_order_id_fkey;
ALTER TABLE devices ADD CONSTRAINT devices_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- STEP 6: Add essential indexes only (skip existing ones)
-- Note: We're not recreating existing indexes to avoid conflicts
-- Your existing indexes should continue to work fine

SELECT 'Migration completed successfully!' as result; 