-- =====================================================
-- CLEANUP OLD TRIGGERS THEN FIX
-- =====================================================
-- This removes ALL old triggers that might reference order_number
-- Then creates fresh triggers without those references
-- =====================================================

-- =====================================================
-- STEP 1: REMOVE ALL OLD TRIGGERS
-- =====================================================

-- Drop all inventory-related triggers from public.orders
DROP TRIGGER IF EXISTS trigger_reduce_inventory ON public.orders;
DROP TRIGGER IF EXISTS trigger_reduce_inventory_public ON public.orders;
DROP TRIGGER IF EXISTS reduce_inventory_trigger ON public.orders;
DROP TRIGGER IF EXISTS inventory_reduction_trigger ON public.orders;

-- Drop all inventory-related triggers from orders (other schema)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema != 'public') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trigger_reduce_inventory ON orders';
        EXECUTE 'DROP TRIGGER IF EXISTS trigger_reduce_inventory_public ON orders';
        EXECUTE 'DROP TRIGGER IF EXISTS reduce_inventory_trigger ON orders';
    END IF;
END $$;

-- Drop old functions
DROP FUNCTION IF EXISTS reduce_inventory_on_order() CASCADE;
DROP FUNCTION IF EXISTS reduce_inventory_on_public_order() CASCADE;

SELECT 'Step 1 Complete: Old triggers and functions removed' as status;

-- =====================================================
-- STEP 2: ENSURE TABLES EXIST
-- =====================================================

-- Create public.orders if not exists
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE,
  user_id UUID,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  customer_email TEXT,
  is_guest BOOLEAN DEFAULT false,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create public.order_items if not exists
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  variant TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  product_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_id_fkey'
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE public.order_items 
        ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    END IF;
END $$;

SELECT 'Step 2 Complete: Tables verified/created' as status;

-- =====================================================
-- STEP 3: ADD MISSING COLUMNS
-- =====================================================

DO $$ 
BEGIN
    -- Add product_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'order_items' 
                   AND column_name = 'product_id') THEN
        ALTER TABLE public.order_items ADD COLUMN product_id TEXT;
    END IF;
    
    -- Add size
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'order_items' 
                   AND column_name = 'size') THEN
        ALTER TABLE public.order_items ADD COLUMN size TEXT;
    END IF;
    
    -- Add color
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'order_items' 
                   AND column_name = 'color') THEN
        ALTER TABLE public.order_items ADD COLUMN color TEXT;
    END IF;
    
    -- Add sku
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'order_items' 
                   AND column_name = 'sku') THEN
        ALTER TABLE public.order_items ADD COLUMN sku TEXT;
    END IF;
    
    -- Add variant_details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'order_items' 
                   AND column_name = 'variant_details') THEN
        ALTER TABLE public.order_items ADD COLUMN variant_details JSONB;
    END IF;
    
    -- Add variant_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'order_items' 
                   AND column_name = 'variant_id') THEN
        ALTER TABLE public.order_items ADD COLUMN variant_id UUID;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_size ON public.order_items(size);
CREATE INDEX IF NOT EXISTS idx_order_items_color ON public.order_items(color);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON public.order_items(sku);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id);

SELECT 'Step 3 Complete: All columns added' as status;

-- =====================================================
-- STEP 4: CREATE NEW TRIGGER FUNCTION (NO COLUMN REFS)
-- =====================================================

CREATE OR REPLACE FUNCTION reduce_inventory_on_public_order()
RETURNS TRIGGER AS $$
DECLARE
    order_item RECORD;
    variant RECORD;
    match_found BOOLEAN;
BEGIN
    -- Only process completed orders
    IF NEW.status != 'completed' OR (OLD IS NOT NULL AND OLD.status = 'completed') THEN
        RETURN NEW;
    END IF;
    
    -- Process each order item
    FOR order_item IN 
        SELECT * FROM public.order_items WHERE order_id = NEW.id
    LOOP
        match_found := FALSE;
        
        -- Strategy 1: variant_id match
        IF order_item.variant_id IS NOT NULL THEN
            UPDATE product_variants 
            SET stock_quantity = stock_quantity - order_item.quantity, 
                updated_at = NOW()
            WHERE id = order_item.variant_id 
            AND is_active = true 
            AND available_quantity >= order_item.quantity
            RETURNING * INTO variant;
            
            IF FOUND THEN
                INSERT INTO inventory_movements (variant_id, movement_type, quantity, previous_stock, new_stock, order_id, notes, created_by)
                VALUES (variant.id, 'sale', -order_item.quantity, variant.stock_quantity + order_item.quantity, variant.stock_quantity, NEW.id, 'Order completed', 'system');
                match_found := TRUE;
                CONTINUE;
            END IF;
        END IF;
        
        -- Strategy 2: SKU match
        IF NOT match_found AND order_item.sku IS NOT NULL THEN
            UPDATE product_variants 
            SET stock_quantity = stock_quantity - order_item.quantity, 
                updated_at = NOW()
            WHERE sku = order_item.sku 
            AND is_active = true 
            AND available_quantity >= order_item.quantity
            RETURNING * INTO variant;
            
            IF FOUND THEN
                INSERT INTO inventory_movements (variant_id, movement_type, quantity, previous_stock, new_stock, order_id, notes, created_by)
                VALUES (variant.id, 'sale', -order_item.quantity, variant.stock_quantity + order_item.quantity, variant.stock_quantity, NEW.id, 'Order completed (SKU)', 'system');
                match_found := TRUE;
                CONTINUE;
            END IF;
        END IF;
        
        -- Strategy 3: product_id + size + color
        IF NOT match_found AND order_item.product_id IS NOT NULL AND order_item.size IS NOT NULL THEN
            UPDATE product_variants 
            SET stock_quantity = stock_quantity - order_item.quantity, 
                updated_at = NOW()
            WHERE product_id = order_item.product_id 
            AND size = order_item.size
            AND (order_item.color IS NULL OR color = order_item.color)
            AND is_active = true 
            AND available_quantity >= order_item.quantity
            RETURNING * INTO variant;
            
            IF FOUND THEN
                INSERT INTO inventory_movements (variant_id, movement_type, quantity, previous_stock, new_stock, order_id, notes, created_by)
                VALUES (variant.id, 'sale', -order_item.quantity, variant.stock_quantity + order_item.quantity, variant.stock_quantity, NEW.id, 'Order completed (match)', 'system');
                match_found := TRUE;
                CONTINUE;
            END IF;
        END IF;
        
        -- Strategy 4: Variant name
        IF NOT match_found AND order_item.variant IS NOT NULL THEN
            UPDATE product_variants 
            SET stock_quantity = stock_quantity - order_item.quantity, 
                updated_at = NOW()
            WHERE (variant_name ILIKE '%' || order_item.variant || '%'
                   OR size ILIKE '%' || order_item.variant || '%'
                   OR COALESCE(color, '') ILIKE '%' || order_item.variant || '%')
            AND is_active = true 
            AND available_quantity >= order_item.quantity
            RETURNING * INTO variant;
            
            IF FOUND THEN
                INSERT INTO inventory_movements (variant_id, movement_type, quantity, previous_stock, new_stock, order_id, notes, created_by)
                VALUES (variant.id, 'sale', -order_item.quantity, variant.stock_quantity + order_item.quantity, variant.stock_quantity, NEW.id, 'Order completed (name)', 'system');
                match_found := TRUE;
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in inventory reduction: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'Step 4 Complete: New trigger function created' as status;

-- =====================================================
-- STEP 5: INSTALL NEW TRIGGER
-- =====================================================

CREATE TRIGGER trigger_reduce_inventory_public
    AFTER INSERT OR UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION reduce_inventory_on_public_order();

SELECT 'Step 5 Complete: New trigger installed' as status;

-- =====================================================
-- STEP 6: VERIFICATION
-- =====================================================

-- Show what we have
SELECT 'VERIFICATION RESULTS:' as status;

SELECT 'Columns in order_items:' as info, COUNT(*) as count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'order_items';

SELECT 'Triggers on public.orders:' as info, trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
AND event_object_table = 'orders';

SELECT '✅ SUCCESS: All setup complete!' as final_status;

