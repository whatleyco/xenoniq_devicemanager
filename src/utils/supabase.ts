import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      serial_manifest: {
        Row: {
          id: number;
          serial: string;
          sku: string;
          mac: string;
          ssid: string | null;
          wifi_pw: string | null;
          imei: string | null;
          iccid: string | null;
          provider: string | null;
          batch: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          serial: string;
          sku: string;
          mac: string;
          ssid?: string | null;
          wifi_pw?: string | null;
          imei?: string | null;
          iccid?: string | null;
          provider?: string | null;
          batch?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          serial?: string;
          sku?: string;
          mac?: string;
          ssid?: string | null;
          wifi_pw?: string | null;
          imei?: string | null;
          iccid?: string | null;
          provider?: string | null;
          batch?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          order_name: string;
          order_id: string | null;
          order_date: string | null;
          ship_date: string | null;
          customer: string | null;
          ordered_by: string | null;
          location: string | null;
          address_1: string | null;
          address_2: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          carrier: string | null;
          tracking_number: string | null;
          line_items: any | null; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          order_name: string;
          order_id?: string | null;
          order_date?: string | null;
          ship_date?: string | null;
          customer?: string | null;
          ordered_by?: string | null;
          location?: string | null;
          address_1?: string | null;
          address_2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          carrier?: string | null;
          tracking_number?: string | null;
          line_items?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          order_name?: string;
          order_id?: string | null;
          order_date?: string | null;
          ship_date?: string | null;
          customer?: string | null;
          ordered_by?: string | null;
          location?: string | null;
          address_1?: string | null;
          address_2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          carrier?: string | null;
          tracking_number?: string | null;
          line_items?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      devices: {
        Row: {
          id: number;
          serial: string;
          customer: string | null;
          order_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          serial: string;
          customer?: string | null;
          order_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          serial?: string;
          customer?: string | null;
          order_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}; 