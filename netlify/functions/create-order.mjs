import { clip, json, readJson, withErrors } from "./_shared/http.mjs";
import { getAdmin } from "./_shared/supabase.mjs";
import { priceCart, roundMoney } from "./_shared/catalog.mjs";

function safeOrderNumber(value) {
  const orderNumber = clip(value, 48);
  if (orderNumber && /^COD-[A-Za-z0-9-]{6,40}$/.test(orderNumber)) return orderNumber;
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `COD-${stamp}-${random}`;
}

function addressFrom(input, email) {
  const source = input || {};
  return {
    name: clip(source.name, 80),
    email,
    phone: clip(source.phone, 30),
    line1: clip(source.address || source.line1, 200),
    city: clip(source.city, 80),
    postal_code: clip(source.zipCode || source.postal_code || source.postalCode, 20),
    country: "Lebanon",
  };
}

export default withErrors(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = await readJson(req);
  const email = clip(body.customerEmail || body.delivery?.email || body.billingAddress?.email, 120);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "A valid email is required" }, 400);
  }

  const delivery = body.delivery || body.shippingAddress || body.billingAddress || {};
  if (!clip(delivery.name || body.billingAddress?.name, 80) || !clip(delivery.address || delivery.line1, 200)) {
    return json({ error: "Delivery details are required" }, 400);
  }

  const supabase = getAdmin();
  const cart = await priceCart(supabase, body.items || body.cartItems);
  const orderNumber = safeOrderNumber(body.orderNumber);
  const address = addressFrom(
    { ...delivery, name: delivery.name || body.billingAddress?.name, phone: delivery.phone || body.billingAddress?.phone },
    email
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_email: email,
      is_guest: true,
      subtotal: cart.subtotal,
      discount_total: 0,
      shipping_total: cart.deliveryFee,
      tax_total: 0,
      total_value: cart.total,
      total_amount: cart.total,
      currency: "USD",
      payment_method: "cash_on_delivery",
      shipping_method: "cash_on_delivery",
      status: "completed",
      items: cart.priced.map((line) => ({
        product_id: line.productId,
        name: line.name,
        quantity: line.quantity,
        price: line.unitPrice,
        total: roundMoney(line.unitPrice * line.quantity),
        size: line.size,
        color: line.color,
      })),
      billing_address: address,
      shipping_address: address,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    const status = orderError?.code === "23505" ? 409 : 500;
    return json({ error: status === 409 ? "This order was already submitted" : "Could not create the order" }, status);
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    cart.priced.map((line) => ({
      order_id: order.id,
      product_name: line.name,
      product_id: line.productId,
      size: line.size,
      color: line.color,
      sku: line.sku,
      variant_id: line.variantId,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      total_price: roundMoney(line.unitPrice * line.quantity),
      image_url: line.image,
      variant: [line.color, line.size].filter(Boolean).join(" / ") || null,
      product_metadata: {
        product_id: line.productId,
        selectedSize: line.size,
        selectedColor: line.color,
      },
    }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    const outOfStock = /insufficient stock/i.test(itemsError.message || "");
    return json(
      { error: outOfStock ? "A product in your cart is out of stock" : "Could not create the order" },
      outOfStock ? 409 : 500
    );
  }

  return json({
    success: true,
    orderId: orderNumber,
    subtotal: cart.subtotal,
    deliveryFee: cart.deliveryFee,
    total: cart.total,
  });
});
