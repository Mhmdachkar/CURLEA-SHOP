-- =====================================================
-- DATABASE DIAGNOSTIC - RUN THIS FIRST
-- =====================================================
-- This will show us exactly what tables and columns exist
-- =====================================================

-- 1. List all tables in public schema
SELECT 
    'PUBLIC SCHEMA TABLES' as info,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. List all tables in other schemas (analytics, etc)
SELECT 
    'ALL TABLES (ALL SCHEMAS)' as info,
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- 3. Show columns in public.orders (if exists)
SELECT 
    'PUBLIC.ORDERS COLUMNS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
ORDER BY ordinal_position;

-- 4. Show columns in orders (other schema)
SELECT 
    'ORDERS COLUMNS (OTHER SCHEMA)' as info,
    table_schema,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND table_schema != 'public'
ORDER BY table_schema, ordinal_position;

-- 5. Show columns in public.order_items (if exists)
SELECT 
    'PUBLIC.ORDER_ITEMS COLUMNS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'order_items'
ORDER BY ordinal_position;

-- 6. Show product_variants columns (if exists)
SELECT 
    'PRODUCT_VARIANTS COLUMNS' as info,
    table_schema,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'product_variants'
ORDER BY table_schema, ordinal_position;

-- 7. Show inventory_movements columns (if exists)
SELECT 
    'INVENTORY_MOVEMENTS COLUMNS' as info,
    table_schema,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_movements'
ORDER BY table_schema, ordinal_position;

-- 8. Check if views exist
SELECT 
    'VIEWS' as info,
    table_schema,
    table_name
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- 9. Show all triggers
SELECT 
    'TRIGGERS' as info,
    trigger_name,
    event_object_schema,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY event_object_table, trigger_name;

-- 10. Count rows in key tables
SELECT 'ROW COUNTS' as info;

SELECT 'public.orders' as table_name, COUNT(*) as row_count
FROM public.orders
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders');

SELECT 'public.order_items' as table_name, COUNT(*) as row_count
FROM public.order_items
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items');

SELECT 'product_variants' as table_name, COUNT(*) as row_count
FROM product_variants
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_variants');

SELECT 'inventory_movements' as table_name, COUNT(*) as row_count
FROM inventory_movements
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_movements');

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
/*
RUN THIS FILE FIRST IN SUPABASE SQL EDITOR

This will show us:
1. What tables actually exist
2. What columns each table has
3. What schemas they're in
4. What triggers are installed
5. How many rows are in each table

Once we see the results, we can create a properly targeted fix!
*/


