-- =========================================================
-- MILESTONE FLEET MONITORING & MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL
-- =========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Admin',
    status VARCHAR(50) DEFAULT 'Active',
    last_login TIMESTAMPTZ,
    avatar VARCHAR(500),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    license_class VARCHAR(50) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    safety_score INT DEFAULT 100,
    hours_worked_this_week NUMERIC(5,2) DEFAULT 0,
    experience_years INT DEFAULT 0,
    location VARCHAR(255) NOT NULL DEFAULT 'Depot',
    assigned_vehicle VARCHAR(50) DEFAULT 'Unassigned',
    hire_date DATE DEFAULT CURRENT_DATE,
    emergency_contact VARCHAR(255),
    active_trip_id VARCHAR(50) DEFAULT 'None',
    last_activity VARCHAR(255) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id VARCHAR(50) PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    plate_number VARCHAR(50) NOT NULL,
    assigned_driver VARCHAR(255) DEFAULT 'Unassigned',
    fuel_level INT DEFAULT 100,
    fuel_type VARCHAR(50) DEFAULT 'Diesel',
    status VARCHAR(50) DEFAULT 'Available',
    odometer INT DEFAULT 0,
    location VARCHAR(255) DEFAULT 'Depot',
    active_trip_id VARCHAR(50) DEFAULT 'None',
    efficiency_mpg NUMERIC(5,2) DEFAULT 8.5,
    next_service_date DATE,
    year INT DEFAULT 2024,
    payload_capacity VARCHAR(100) DEFAULT '20,000 lbs',
    vin VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id VARCHAR(50) PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    driver VARCHAR(255) NOT NULL DEFAULT 'Unassigned',
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    status_color VARCHAR(100) DEFAULT 'bg-gray-100 text-gray-800',
    delay_reason VARCHAR(255),
    amount VARCHAR(50) DEFAULT '$0.00',
    vehicle_no VARCHAR(50) DEFAULT 'Unassigned',
    driver_contact VARCHAR(50) DEFAULT '--',
    load_type VARCHAR(100) DEFAULT 'General Freight',
    priority VARCHAR(50) DEFAULT 'Medium',
    current_location VARCHAR(255) DEFAULT 'Depot',
    eta TIMESTAMPTZ,
    pod_status VARCHAR(50) DEFAULT 'Pending',
    last_updated VARCHAR(100) DEFAULT 'Just now',
    distance VARCHAR(50) DEFAULT '0 km',
    total_stops INT DEFAULT 1,
    fuel_used VARCHAR(50) DEFAULT '0 L',
    expected_delivery DATE,
    created_time TIMESTAMPTZ DEFAULT NOW(),
    assigned_time TIMESTAMPTZ,
    loaded_time TIMESTAMPTZ,
    dispatched_time TIMESTAMPTZ,
    in_transit_time TIMESTAMPTZ,
    delivered_time TIMESTAMPTZ,
    route_progress JSONB NOT NULL DEFAULT '{"steps": [], "totalStops": 0, "completedCount": 0, "nextStopLocation": ""}',
    executions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRIP STOPS TABLE
CREATE TABLE IF NOT EXISTS public.trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id VARCHAR(50) REFERENCES public.trips(id) ON DELETE CASCADE,
    stop_idx INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    time VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    goods_type VARCHAR(255),
    quantity VARCHAR(100),
    cargo_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CARGO EXECUTION TABLE
CREATE TABLE IF NOT EXISTS public.cargo_execution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id VARCHAR(50) REFERENCES public.trips(id) ON DELETE CASCADE,
    stop_idx INT NOT NULL,
    item_idx INT NOT NULL,
    actual_quantity INT NOT NULL DEFAULT 0,
    reason VARCHAR(100) NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(255) DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DELAY EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.delay_events (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'DEV-' || gen_random_uuid()::text,
    trip_id VARCHAR(50) REFERENCES public.trips(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'Medium',
    remarks TEXT,
    reported_by VARCHAR(255) NOT NULL DEFAULT 'Driver',
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    estimated_recovery TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'ACT-' || extract(epoch from now())::text,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    "user" VARCHAR(255) DEFAULT 'Admin',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_execution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delay_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public/authenticated read and write access for application operations
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all access to drivers" ON public.drivers FOR ALL USING (true);
CREATE POLICY "Allow all access to vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Allow all access to trips" ON public.trips FOR ALL USING (true);
CREATE POLICY "Allow all access to trip_stops" ON public.trip_stops FOR ALL USING (true);
CREATE POLICY "Allow all access to cargo_execution" ON public.cargo_execution FOR ALL USING (true);
CREATE POLICY "Allow all access to delay_events" ON public.delay_events FOR ALL USING (true);
CREATE POLICY "Allow all access to activities" ON public.activities FOR ALL USING (true);
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all access to settings" ON public.settings FOR ALL USING (true);

-- ENABLE REALTIME ON TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delay_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- STORAGE BUCKETS SETUP PREPARATION
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('proof-of-delivery', 'proof-of-delivery', true),
  ('documents', 'documents', true),
  ('attachments', 'attachments', true),
  ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
