-- ==========================================
-- FIX: Replace legacy "brown" color with "Latte" safely
-- Handles duplicate keys by merging stock into a single Latte row
-- ==========================================

BEGIN;

-- 1) Aggregate all “brown” rows into their target “Latte” per product/size
WITH mapped AS (
  SELECT
    id,
    product_id,
    size,
    color,
    'Latte'::text AS target_color,
    stock_quantity,
    COALESCE(reserved_quantity, 0) AS reserved_quantity,
    price,
    is_active,
    variant_name
  FROM product_variants
  WHERE LOWER(color) = 'brown'
),
target AS (
  SELECT
    product_id,
    size,
    target_color,
    MIN(id) AS keep_id,                    -- keep one row
    SUM(stock_quantity) AS total_stock,    -- sum stock
    SUM(reserved_quantity) AS total_reserved,
    MAX(price) FILTER (WHERE price IS NOT NULL) AS price,
    BOOL_OR(is_active) AS is_active        -- active if any active
  FROM mapped
  GROUP BY product_id, size, target_color
),
updated AS (
  -- Update the keeper row to Latte and set merged quantities
  UPDATE product_variants pv
  SET
    color = 'Latte',
    variant_name = REPLACE(REPLACE(variant_name, 'brown', 'Latte'), 'Brown', 'Latte'),
    stock_quantity = t.total_stock,
    reserved_quantity = t.total_reserved,
    price = COALESCE(t.price, pv.price),
    is_active = COALESCE(t.is_active, pv.is_active),
    updated_at = NOW()
  FROM target t
  WHERE pv.id = t.keep_id
  RETURNING pv.id
),
deleted AS (
  -- Delete the other duplicates we just merged
  DELETE FROM product_variants pv
  USING mapped m, target t
  WHERE pv.id = m.id
    AND pv.id <> t.keep_id
  RETURNING pv.id
)
-- 2) Second pass: rename any remaining “brown” rows only if no Latte exists yet
UPDATE product_variants pv
SET
  color = 'Latte',
  variant_name = REPLACE(REPLACE(variant_name, 'brown', 'Latte'), 'Brown', 'Latte'),
  updated_at = NOW()
WHERE LOWER(color) = 'brown'
  AND NOT EXISTS (
    SELECT 1
    FROM product_variants p2
    WHERE p2.product_id = pv.product_id
      AND p2.size = pv.size
      AND COALESCE(p2.color, '') = 'Latte'
      AND p2.id <> pv.id
  );

COMMIT;

-- Verification (optional):
-- SELECT product_id, size, color, stock_quantity FROM product_variants WHERE color = 'Latte';