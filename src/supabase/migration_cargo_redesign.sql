-- =========================================================
-- ENTERPRISE CARGO EXECUTION MODULE REDESIGN MIGRATION
-- Normalizes Cargo & Execution Event Architecture
-- Compatible with Supabase PostgreSQL / TMS & WMS Standards
-- =========================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATE TRIP CARGO MASTER TABLE
CREATE TABLE IF NOT EXISTS public.trip_cargo (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'CRG-' || gen_random_uuid()::text,
    trip_id VARCHAR(50) NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    pickup_stop_id UUID REFERENCES public.trip_stops(id) ON DELETE SET NULL,
    delivery_stop_id UUID REFERENCES public.trip_stops(id) ON DELETE SET NULL,
    sku VARCHAR(100) NOT NULL DEFAULT 'SKU-GENERAL',
    description TEXT NOT NULL DEFAULT 'General Cargo',
    weight VARCHAR(50) DEFAULT '0 kg',
    volume VARCHAR(50) DEFAULT '0 m3',
    planned_quantity INT NOT NULL DEFAULT 1,
    current_quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'Boxes',
    status VARCHAR(50) NOT NULL DEFAULT 'Planned',
    remarks TEXT,
    created_by VARCHAR(255) DEFAULT 'Dispatcher',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE CARGO EXECUTION EVENTS AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.cargo_execution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id VARCHAR(100) NOT NULL REFERENCES public.trip_cargo(id) ON DELETE CASCADE,
    trip_id VARCHAR(50) NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    stop_id UUID REFERENCES public.trip_stops(id) ON DELETE CASCADE,
    execution_type VARCHAR(50) NOT NULL, -- 'Pickup', 'Drop', 'Partial Pickup', 'Partial Drop', 'Damage', 'Shortage', 'Overage', 'Rejected', 'Cancelled', 'Returned'
    execution_status VARCHAR(50) NOT NULL DEFAULT 'Completed', -- 'Completed', 'Partial', 'Failed', 'Pending'
    planned_qty INT NOT NULL DEFAULT 0,
    actual_qty INT NOT NULL DEFAULT 0,
    variance INT NOT NULL DEFAULT 0,
    reason VARCHAR(100),
    remarks TEXT,
    performed_by VARCHAR(255) DEFAULT 'Dispatcher',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    photo_url TEXT,
    signature_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE PERFORMANCE INDEXES FOR HIGH-THROUGHPUT QUERIES
CREATE INDEX IF NOT EXISTS idx_trip_cargo_trip_id ON public.trip_cargo(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_cargo_pickup_stop ON public.trip_cargo(pickup_stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_cargo_delivery_stop ON public.trip_cargo(delivery_stop_id);

CREATE INDEX IF NOT EXISTS idx_cargo_exec_events_cargo_id ON public.cargo_execution_events(cargo_id);
CREATE INDEX IF NOT EXISTS idx_cargo_exec_events_trip_id ON public.cargo_execution_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_cargo_exec_events_stop_id ON public.cargo_execution_events(stop_id);
CREATE INDEX IF NOT EXISTS idx_cargo_exec_events_timestamp ON public.cargo_execution_events(timestamp DESC);

-- 4. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.trip_cargo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_execution_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to trip_cargo" ON public.trip_cargo;
CREATE POLICY "Allow all access to trip_cargo" ON public.trip_cargo FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to cargo_execution_events" ON public.cargo_execution_events;
CREATE POLICY "Allow all access to cargo_execution_events" ON public.cargo_execution_events FOR ALL USING (true);

-- 5. REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_cargo;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cargo_execution_events;

-- 6. DATA MIGRATION LOGIC (Populate trip_cargo from existing trip & trip_stops data)
DO $$
DECLARE
    t RECORD;
    pickup_stop UUID;
    delivery_stop UUID;
    new_cargo_id VARCHAR(100);
BEGIN
    FOR t IN SELECT id, origin, destination, load_type FROM public.trips LOOP
        -- Locate pickup stop ID and delivery stop ID if available
        SELECT id INTO pickup_stop FROM public.trip_stops WHERE trip_id = t.id AND type = 'Pickup' ORDER BY stop_idx ASC LIMIT 1;
        SELECT id INTO delivery_stop FROM public.trip_stops WHERE trip_id = t.id AND type = 'Delivery' ORDER BY stop_idx DESC LIMIT 1;
        
        -- Insert normalized master cargo row if none exists
        IF NOT EXISTS (SELECT 1 FROM public.trip_cargo WHERE trip_id = t.id) THEN
            new_cargo_id := 'CRG-' || UPPER(SUBSTRING(t.id FROM 1 FOR 8)) || '-01';
            INSERT INTO public.trip_cargo (
                id,
                trip_id,
                pickup_stop_id,
                delivery_stop_id,
                sku,
                description,
                planned_quantity,
                current_quantity,
                unit,
                status
            ) VALUES (
                new_cargo_id,
                t.id,
                pickup_stop,
                delivery_stop,
                'SKU-250BX',
                COALESCE(t.load_type, 'General Freight Cargo'),
                250,
                248,
                'Boxes',
                'In Transit'
            );

            -- Migrate legacy cargo_execution row if available
            INSERT INTO public.cargo_execution_events (
                cargo_id,
                trip_id,
                stop_id,
                execution_type,
                execution_status,
                planned_qty,
                actual_qty,
                variance,
                reason,
                remarks,
                performed_by,
                timestamp
            )
            SELECT 
                new_cargo_id,
                ce.trip_id,
                pickup_stop,
                'Pickup',
                'Partial',
                250,
                ce.actual_quantity,
                (250 - ce.actual_quantity),
                ce.reason,
                ce.remarks,
                ce.updated_by,
                ce.timestamp
            FROM public.cargo_execution ce
            WHERE ce.trip_id = t.id
            LIMIT 1;
        END IF;
    END LOOP;
END $$;
