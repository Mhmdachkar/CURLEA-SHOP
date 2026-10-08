import Stripe from "stripe";
import { clip, json, readJson, requestOrigin, withErrors } from "./_shared/http.mjs";
import { getAdmin } from "./_shared/supabase.mjs";
import { priceCart, roundMoney } from "./_shared/catalog.mjs";

const SHIPPING_COUNTRIES = [
  "US", "CA", "GB", "DE", "FR", "IT", "ES", "AU", "NZ",
  "NL", "BE", "CH", "AT", "DK", "FI", "IE", "LU", "NO",
  "PL", "PT", "SE", "AE", "SA", "QA", "KW", "BH", "OM",
  "JO", "LB", "EG", "MA", "TN", "DZ", "IQ", "LY", "YE",
  "SD", "PS",
];

function absoluteImage(origin, image) {
  if (!image || !origin) return null;
  try {
    const url = new URL(image, origin);
    if (url.origin !== origin) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export default withErrors(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return json({ error: "Server configuration error" }, 500);

  const body = await readJson(req);
  const supabase = getAdmin();
  const cart = await priceCart(supabase, body.cartItems || body.items);
  const origin = requestOrigin(req);
  if (!origin) return json({ error: "Missing site origin" }, 400);

  const currency = "usd";
  const lineItems = cart.priced.map((line) => {
    const image = absoluteImage(origin, line.image);
    return {
      price_data: {
        currency,
        product_data: {
          name: `${line.name}${line.color || line.size ? ` - ${[line.color, line.size].filter(Boolean).join(" / ")}` : ""}`,
          ...(image ? { images: [image] } : {}),
        },
        unit_amount: Math.round(line.unitPrice * 100),
      },
      quantity: line.quantity,
    };
  });
  lineItems.push({
    price_data: {
      currency,
      product_data: { name: "Delivery Fee" },
      unit_amount: Math.round(cart.deliveryFee * 100),
    },
    quantity: 1,
  });

  const orderNumber = `AU-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
  const sessionId = clip(body.sessionId, 80);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_id: orderNumber,
      session_id: sessionId || "anonymous",
      subtotal: cart.subtotal,
      discount_total: 0,
      shipping_total: cart.deliveryFee,
      tax_total: 0,
      total_value: cart.total,
      currency: "USD",
      payment_method: "stripe",
      shipping_method: "standard",
      source: clip(body.utm_source, 80) || "direct",
      utm_source: clip(body.utm_source, 80),
      utm_medium: clip(body.utm_medium, 80),
      utm_campaign: clip(body.utm_campaign, 80),
      items: cart.priced.map((line) => ({
        id: line.productId,
        name: line.name,
        quantity: line.quantity,
        price: line.unitPrice,
        total: roundMoney(line.unitPrice * line.quantity),
        size: line.size,
        color: line.color,
      })),
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) return json({ error: "Could not start checkout" }, 500);

  const { data: publicOrder, error: publicOrderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      total_amount: cart.total,
      total_value: cart.total,
      subtotal: cart.subtotal,
      shipping_total: cart.deliveryFee,
      currency: "USD",
      status: "pending",
      is_guest: true,
      payment_method: "stripe",
    })
    .select("id")
    .single();

  if (publicOrderError || !publicOrder) {
    await supabase.from("orders").delete().eq("id", order.id);
    return json({ error: "Could not start checkout" }, 500);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        total_amount: String(cart.total),
        items_count: String(cart.priced.length),
      },
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
      phone_number_collection: { enabled: true },
      customer_creation: "always",
    });
  } catch (error) {
    await supabase.from("orders").delete().in("id", [order.id, publicOrder.id]);
    console.error(error);
    return json({ error: "Could not start checkout" }, 500);
  }

  await supabase
    .from("orders")
    .update({ stripe_session_id: session.id })
    .eq("id", publicOrder.id);

  if (!session.url) {
    return json({ error: "Could not start checkout" }, 500);
  }

  return json({ sessionId: session.id, url: session.url });
});
