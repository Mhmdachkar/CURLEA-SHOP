import { json, withErrors } from "./_shared/http.mjs";
import { getAdmin } from "./_shared/supabase.mjs";

export default withErrors(async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const productId = new URL(req.url).searchParams.get("productId") || "";
  if (!/^[a-z0-9-]{1,80}$/i.test(productId)) {
    return json({ error: "Unknown product" }, 400);
  }

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, product_id, size, color, available_quantity")
    .eq("product_id", productId)
    .eq("is_active", true);

  if (error) return json({ error: "Could not load stock" }, 500);

  return json({
    variants: (data || []).map((row) => ({
      id: row.id,
      product_id: row.product_id,
      size: row.size,
      color: row.color,
      available_quantity: row.available_quantity ?? 0,
    })),
  });
});
