-- XenonIQ Device Manager Database Schema
-- Run this SQL in your Supabase SQL editor

-- Create serial_manifest table
CREATE TABLE serial_manifest (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) NOT NULL,
    mac VARCHAR(12) NOT NULL, -- MAC address format: AABBCCDDEEFF (12 hex chars, no separators)
    ssid VARCHAR(255),
    wifi_pw VARCHAR(255),
    imei VARCHAR(20),
    iccid VARCHAR(22),
    provider VARCHAR(100),
    batch VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_name VARCHAR(100) UNIQUE NOT NULL, -- Like "X1234"
    order_id VARCHAR(255), -- Shopify GraphQL order id
    order_date DATE,
    ship_date DATE,
    customer VARCHAR(255),
    ordered_by VARCHAR(255),
    location VARCHAR(255), -- warehouse name
    address_1 VARCHAR(255), -- shipping address
    address_2 VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(100),
    zip VARCHAR(20),
    carrier VARCHAR(100), -- shipping carrier
    tracking_number VARCHAR(255),
    line_items JSONB, -- Format: [{"sku": "CTRL-001", "quantity": 2, "serials": ["SN001", "SN002"]}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create devices table (stores shipped/in-field controllers)
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

-- Enable Row Level Security (RLS)
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

-- Function to get device details with manifest data (for the JOIN requirement)
CREATE OR REPLACE FUNCTION get_device_with_manifest(device_serial VARCHAR)
RETURNS TABLE (
    serial VARCHAR,
    customer VARCHAR,
    order_name VARCHAR,
    sku VARCHAR,
    mac VARCHAR,
    ssid VARCHAR,
    wifi_pw VARCHAR,
    imei VARCHAR,
    iccid VARCHAR,
    provider VARCHAR,
    batch VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.serial,
        d.customer,
        d.order_name,
        sm.sku,
        sm.mac,
        sm.ssid,
        sm.wifi_pw,
        sm.imei,
        sm.iccid,
        sm.provider,
        sm.batch
    FROM devices d
    LEFT JOIN serial_manifest sm ON d.serial = sm.serial
    WHERE d.serial = device_serial;
END;
$$ LANGUAGE plpgsql; 