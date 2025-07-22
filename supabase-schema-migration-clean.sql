-- Clean migration script - Add ID columns and update primary keys

-- Step 1: Drop foreign key constraints
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_serial_fkey;
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_order_name_fkey;

-- Step 2: Add ID columns
ALTER TABLE serial_manifest ADD COLUMN IF NOT EXISTS id SERIAL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS id SERIAL;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS id SERIAL;

-- Step 3: Update serial_manifest table
ALTER TABLE serial_manifest DROP CONSTRAINT IF EXISTS serial_manifest_pkey;
ALTER TABLE serial_manifest ADD CONSTRAINT serial_manifest_pkey PRIMARY KEY (id);
ALTER TABLE serial_manifest ADD CONSTRAINT serial_manifest_serial_unique UNIQUE (serial);

-- Step 4: Update orders table
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE orders ADD CONSTRAINT orders_order_name_unique UNIQUE (order_name);

-- Step 5: Update devices table
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_pkey;
ALTER TABLE devices ADD CONSTRAINT devices_pkey PRIMARY KEY (id);
ALTER TABLE devices ADD CONSTRAINT devices_serial_unique UNIQUE (serial);

-- Step 6: Add order_id column to devices
ALTER TABLE devices ADD COLUMN IF NOT EXISTS order_id INTEGER;

-- Step 7: Populate order_id from order_name
UPDATE devices SET order_id = orders.id FROM orders WHERE devices.order_name = orders.order_name AND devices.order_id IS NULL;

-- Step 8: Remove old order_name column
ALTER TABLE devices DROP COLUMN IF EXISTS order_name;

-- Step 9: Add new foreign key
ALTER TABLE devices DROP CONSTRAINT IF EXISTS devices_order_id_fkey;
ALTER TABLE devices ADD CONSTRAINT devices_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL; 