-- XenonIQ Device Manager - Fresh Database Schema
-- WARNING: This will DROP ALL EXISTING DATA
-- Run this in your Supabase SQL editor to start fresh

-- Drop all existing tables and dependencies
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS orders CASCADE;  
DROP TABLE IF EXISTS serial_manifest CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create serial_manifest table with id primary key
CREATE TABLE serial_manifest (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) NOT NULL,
    mac VARCHAR(12) NOT NULL,
    ssid VARCHAR(255),
    wifi_pw VARCHAR(255),
    imei VARCHAR(20),
    iccid VARCHAR(22),
    provider VARCHAR(100),
    batch VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with id primary key
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_name VARCHAR(100) UNIQUE NOT NULL,
    order_id VARCHAR(255),
    order_date DATE,
    ship_date DATE,
    customer VARCHAR(255),
    ordered_by VARCHAR(255),
    location VARCHAR(255),
    address_1 VARCHAR(255),
    address_2 VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(100),
    zip VARCHAR(20),
    carrier VARCHAR(100),
    tracking_number VARCHAR(255),
    line_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create devices table with id primary key and order_id foreign key
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(255) UNIQUE NOT NULL,
    customer VARCHAR(255),
    order_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_serial_manifest_serial ON serial_manifest(serial);
CREATE INDEX idx_serial_manifest_sku ON serial_manifest(sku);
CREATE INDEX idx_orders_order_name ON orders(order_name);
CREATE INDEX idx_orders_customer ON orders(customer);
CREATE INDEX idx_devices_serial ON devices(serial);
CREATE INDEX idx_devices_customer ON devices(customer);
CREATE INDEX idx_devices_order_id ON devices(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_serial_manifest_updated_at BEFORE UPDATE ON serial_manifest FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE serial_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON serial_manifest
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON devices
    FOR ALL USING (auth.role() = 'authenticated');

-- Success message
SELECT 'Fresh schema created successfully! All tables now use id primary keys.' as result; 