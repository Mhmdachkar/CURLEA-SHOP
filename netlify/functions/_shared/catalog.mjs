import { clip } from "./http.mjs";

const SIZE_MAP = {
  Original: "Large",
  Large: "Large",
  Mini: "Mini",
  Midi: "Midi",
  Jumbo: "Jumbo",
  Small: "Small",
  "One Size": "Standard",
  Standard: "Standard",
  Default: "Standard",
};

const COLOR_MAP = {
  purple: "Mulberry",
  Purple: "Mulberry",
  PURPLE: "Mulberry",
  mulberry: "Mulberry",
  Mulberry: "Mulberry",
  MULBERRY: "Mulberry",
  pink: "CANDY",
  Pink: "CANDY",
  PINK: "CANDY",
  candy: "CANDY",
  Candy: "CANDY",
  CANDY: "CANDY",
  brown: "Latte",
  Brown: "Latte",
  BROWN: "Latte",
  latte: "Latte",
  Latte: "Latte",
  LATTE: "Latte",
  green: "Olive",
  Green: "Olive",
  GREEN: "Olive",
  olive: "Olive",
  Olive: "Olive",
  OLIVE: "Olive",
  "Royal Purple": "Royal Purple",
  "Rose Gold": "Rose Gold",
  "Earl Grey": "Earl Grey",
  "Olive Lux": "Olive Lux",
};

const ACCESSORIES = new Set([
  "curly-clip-1",
  "curly-scarf-1",
  "satin-scrunchies-french-5pc",
  "curly-claw-1",
  "korean-clips-10set",
  "bow-tie-7set",
  "songmay-hair-clips",
]);

export function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function mapSize(size) {
  if (!size) return null;
  return SIZE_MAP[size] || size;
}

function mapColor(color) {
  if (!color) return null;
  return COLOR_MAP[color] || color;
}

function productIdFrom(item) {
  return clip(
    item?.id || item?.product_id || item?.product_metadata?.product_id,
    80
  );
}

async function findVariant(supabase, productId, size, color) {
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, product_id, size, color, price, stock_quantity, available_quantity, sku")
    .eq("product_id", productId)
    .eq("is_active", true);

  if (error) {
    const failure = new Error("Could not check this product");
    failure.status = 500;
    throw failure;
  }

  const rows = data || [];
  const mappedSize = mapSize(size) || (ACCESSORIES.has(productId) ? "Standard" : null);
  const mappedColor = mapColor(color);
  let match = rows.find(
    (row) => row.size === mappedSize && (row.color || null) === (mappedColor || null)
  );
  if (!match && ACCESSORIES.has(productId)) {
    match = rows[0] || null;
  }
  return { match, mappedSize: match?.size || mappedSize, mappedColor: match?.color ?? mappedColor };
}

export async function priceCart(supabase, items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
    const error = new Error("Cart is empty");
    error.status = 400;
    throw error;
  }

  const priced = [];
  for (const item of items) {
    const productId = productIdFrom(item);
    if (!productId || !/^[a-z0-9-]{1,80}$/i.test(productId)) {
      const error = new Error("Unknown product");
      error.status = 400;
      throw error;
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      const error = new Error("Invalid quantity");
      error.status = 400;
      throw error;
    }

    const size =
      item.selectedSize ||
      item.size ||
      item.product_metadata?.selectedSize ||
      item.product_metadata?.size ||
      null;
    const color =
      item.selectedColor ||
      item.color ||
      item.product_metadata?.selectedColor ||
      item.product_metadata?.color ||
      null;

    const found = await findVariant(supabase, productId, size, color);
    if (!found.match) {
      const error = new Error("A product in your cart is no longer available");
      error.status = 400;
      throw error;
    }

    const available = Number(found.match.available_quantity ?? found.match.stock_quantity ?? 0);
    if (available < quantity) {
      const error = new Error("A product in your cart is out of stock");
      error.status = 409;
      throw error;
    }

    const price = Number(found.match.price);
    if (!Number.isFinite(price) || price <= 0 || price > 10000) {
      const error = new Error("A product in your cart cannot be purchased");
      error.status = 400;
      throw error;
    }

    priced.push({
      productId,
      name: clip(item.product_name || item.name, 120) || "CURLEA item",
      quantity,
      unitPrice: price,
      size: found.mappedSize,
      color: found.mappedColor,
      sku: found.match.sku || null,
      variantId: found.match.id,
      image: clip(item.image_url || item.image, 500),
    });
  }

  const subtotal = roundMoney(priced.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const deliveryFee = 4;
  return { priced, subtotal, deliveryFee, total: roundMoney(subtotal + deliveryFee) };
}
