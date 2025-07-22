# XenonIQ Device Manager - Setup Guide

## Current Status: ✅ MVP Complete + Schema Standardized

### Completed Features:
- ✅ **Authentication System** - Supabase auth with login/register
- ✅ **Serial Manifest Management** - CRUD operations for device manufacturing data
- ✅ **Order Management** - Full order lifecycle with line items
- ✅ **Device Management** - Automated device creation from orders
- ✅ **Data Integrity** - Strict validation preventing duplicate devices
- ✅ **Standard Refine Integration** - All tables now use `id` primary keys

### 🚨 **IMPORTANT: Database Migration Required**

The database schema has been updated to use standard `id` primary keys instead of custom primary keys (`serial`, `order_name`). This enables full compatibility with Refine's built-in components.

**You must run the migration script before the app will work properly:**

1. Copy the migration script from `supabase-schema-update.sql`
2. Run it in your Supabase SQL editor
3. This will:
   - Add `id` columns as primary keys to all tables
   - Convert `serial` and `order_name` to unique constraints
   - Update foreign key relationships to use `id` references
   - Preserve all existing data

## Quick Setup

### 1. Environment Setup
```bash
cd xenoniq-device-manager
npm install
```

### 2. Environment Variables
Create `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

#### Option A: Fresh Setup (New Database)
Run the complete schema in your Supabase SQL editor:
```sql
-- Use contents of supabase-schema.sql
```

#### Option B: Migration (Existing Database)
Run the migration script in your Supabase SQL editor:
```sql
-- Use contents of supabase-schema-update.sql
```

### 4. Start Development
```bash
npm run dev
```

## Features Overview

### Serial Manifest
- **Purpose**: Store bulk device info from factory
- **Fields**: SKU, Serial, MAC, SSID, WiFi password, IMEI, ICCID, Provider, Batch
- **Validation**: MAC address format (12 hex chars), required fields

### Orders
- **Purpose**: Track customer purchase orders and shipping
- **Fields**: Order name, customer, shipping details, line items (JSONB)
- **Line Items**: SKU, quantity, serial numbers (text area input)
- **Automation**: Creates device records for all serials in line items

### Devices
- **Purpose**: Track shipped/in-field controllers
- **Fields**: Serial, customer, order reference
- **Data Source**: Automatically populated from orders + joined with manifest data
- **Display**: Shows combined device + manifest info in tables

## Data Flow

1. **Import Serial Manifest** - Add device data from factory
2. **Create Order** - Add customer order with line items containing serial numbers
3. **Automated Device Creation** - System creates device records for each serial
4. **Data Validation**: 
   - ❌ **Fails** if any serial already exists as a device (prevents duplicates)
   - ⚠️ **Warns** if serials not found in manifest (but still creates devices)

## User Interface

### Navigation
- **Dashboard** - Overview page
- **Serial Manifest** - Device manufacturing data management
- **Orders** - Customer order management
- **Devices** - Shipped device tracking

### Standard Refine Features (Now Available)
- ✅ **Search & Filter** - All tables support sorting, filtering, searching
- ✅ **CRUD Operations** - Create, read, update, delete with standard buttons
- ✅ **Form Validation** - Required fields, format validation
- ✅ **Pagination** - Large datasets handled efficiently
- ✅ **Real-time Updates** - Changes reflect immediately

### Special Features
- **Order Deletion** - Requires typing "DELETE" + removes associated devices
- **Bulk Device Creation** - Orders automatically create multiple device records
- **Data Integrity** - All-or-nothing validation prevents partial saves
- **Joined Views** - Device list shows combined manifest + device data

## Next Steps (Future Development)

### Phase 2: Integration
- [ ] **Shopify Webhooks** - Automatic order import from Shopify
- [ ] **Email Notifications** - Alerts for missing serial numbers
- [ ] **Advanced Search** - Cross-table searching and filtering

### Phase 3: Enhancement
- [ ] **Bulk Import** - CSV upload for serial manifest data
- [ ] **Reporting Dashboard** - Charts and analytics
- [ ] **Export Functionality** - CSV/PDF exports
- [ ] **Batch Management** - Enhanced tracking of manufacturing batches

## Architecture

- **Frontend**: React + Refine.dev + Ant Design
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Hosting**: Vercel (recommended)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (email/password)

## Database Schema

### Tables
1. **serial_manifest** - Factory device data (`id` primary key, `serial` unique)
2. **orders** - Customer orders (`id` primary key, `order_name` unique)
3. **devices** - Shipped devices (`id` primary key, `serial` unique, `order_id` foreign key)

### Key Relationships
- `devices.order_id` → `orders.id` (optional - devices can exist without orders)
- Device data joined with manifest data for display
- Orders contain JSONB line items with embedded serial numbers

## Support

For issues or questions:
1. Check console for error messages
2. Verify Supabase connection and permissions
3. Ensure database migration has been run
4. Check that all environment variables are set correctly 