-- ==========================================
-- FIX MISSING ACCESSORIES IN INVENTORY
-- Adds/Updates: curly-claw-1 and curly-scarf-1
-- Date: 2025-12-15
-- ==========================================

BEGIN;

-- Remove any existing entries for these products (to avoid duplicates)
DELETE FROM product_variants 
WHERE product_id IN ('curly-claw-1', 'curly-scarf-1', 'bow-tie-7set');

-- Insert the correct entries
INSERT INTO product_variants (product_id, variant_name, size, color, stock_quantity, price, sku, is_active)
VALUES
    ('curly-claw-1', 'Geometric Flower Hair Claw Clip 10 Set', 'Standard', NULL, 40, 15.99, 'CLAW-CLIPS-10', true),
    ('curly-scarf-1', 'Elegant Satin Scarf + Scrunchies 7 Set', 'Standard', NULL, 22, 11.99, 'SCARF-SCRUNCHIES-7', true);

COMMIT;

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check that the products were added
SELECT 
    product_id,
    variant_name,
    size,
    color,
    stock_quantity,
    available_quantity,
    price,
    is_active
FROM product_variants
WHERE product_id IN ('curly-claw-1', 'curly-scarf-1')
ORDER BY product_id;

