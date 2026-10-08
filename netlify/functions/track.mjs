import { clip, json, readJson, withErrors } from "./_shared/http.mjs";
import { getAdmin } from "./_shared/supabase.mjs";

const EVENT_TYPES = new Set(["visit", "page_view", "event", "cart_event", "order", "order_update"]);
const CART_EVENTS = new Set(["add", "remove", "update", "view", "checkout_start", "checkout_complete", "abandoned"]);

function numberOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

async function visitIdFor(supabase, data) {
  if (data.visit_id) {
    const { data: visit } = await supabase.from("visits").select("id").eq("id", data.visit_id).maybeSingle();
    if (visit?.id) return visit.id;
  }
  const sessionId = clip(data.session_id, 80);
  if (!sessionId) return null;
  const { data: visit } = await supabase
    .from("visits")
    .select("id")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return visit?.id || null;
}

async function handleVisit(supabase, data) {
  const sessionId = clip(data.session_id, 80);
  if (!sessionId) {
    const error = new Error("Missing session");
    error.status = 400;
    throw error;
  }
  const { data: visit, error } = await supabase
    .from("visits")
    .insert({
      session_id: sessionId,
      device: clip(data.device, 40),
      browser: clip(data.browser, 40),
      os: clip(data.os, 40),
      country: clip(data.country, 80),
      city: clip(data.city, 80),
      region: clip(data.region, 80),
      referrer: clip(data.referrer, 300),
      landing_page: clip(data.landing_page, 300),
      utm_source: clip(data.utm_source, 80),
      utm_medium: clip(data.utm_medium, 80),
      utm_campaign: clip(data.utm_campaign, 80),
      utm_term: clip(data.utm_term, 80),
      utm_content: clip(data.utm_content, 80),
      is_mobile: Boolean(data.is_mobile),
      is_tablet: Boolean(data.is_tablet),
      is_desktop: Boolean(data.is_desktop),
      screen_width: numberOrNull(data.screen_width),
      screen_height: numberOrNull(data.screen_height),
      language: clip(data.language, 20),
      timezone: clip(data.timezone, 80),
    })
    .select("id")
    .single();
  if (error) throw error;
  return { visit_id: visit.id };
}

async function handlePageView(supabase, data) {
  const sessionId = clip(data.session_id, 80);
  const url = clip(data.url, 300);
  if (!sessionId || !url) {
    const error = new Error("Missing page view");
    error.status = 400;
    throw error;
  }
  const { data: pageView, error } = await supabase
    .from("page_views")
    .insert({
      session_id: sessionId,
      visit_id: await visitIdFor(supabase, data),
      url,
      path: clip(data.path, 200),
      title: clip(data.title, 160),
      referrer: clip(data.referrer, 300),
      scroll_depth: numberOrNull(data.scroll_depth) || 0,
      time_on_page: numberOrNull(data.time_on_page) || 0,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { page_view_id: pageView.id };
}

async function handleEvent(supabase, data) {
  const sessionId = clip(data.session_id, 80);
  const eventName = clip(data.event_name, 80);
  if (!sessionId || !eventName) {
    const error = new Error("Missing event");
    error.status = 400;
    throw error;
  }
  const { data: event, error } = await supabase
    .from("events")
    .insert({
      session_id: sessionId,
      visit_id: await visitIdFor(supabase, data),
      event_name: eventName,
      event_category: clip(data.event_category, 80),
      event_label: clip(data.event_label, 120),
      event_value: numberOrNull(data.event_value),
      payload: data.payload && typeof data.payload === "object" ? data.payload : {},
    })
    .select("id")
    .single();
  if (error) throw error;
  return { event_id: event.id };
}

async function handleCartEvent(supabase, data) {
  const sessionId = clip(data.session_id, 80);
  const eventType = CART_EVENTS.has(data.event_type) ? data.event_type : null;
  if (!sessionId || !eventType) {
    const error = new Error("Unknown cart event");
    error.status = 400;
    throw error;
  }
  const { data: cartEvent, error } = await supabase
    .from("cart_events")
    .insert({
      session_id: sessionId,
      visit_id: await visitIdFor(supabase, data),
      event_type: eventType,
      external_product_id: clip(data.external_product_id, 80),
      product_title: clip(data.product_title, 160),
      variant_title: clip(data.variant_title, 80),
      quantity: numberOrNull(data.quantity) || 1,
      price: numberOrNull(data.price),
      total_value: numberOrNull(data.total_value),
      cart_total: numberOrNull(data.cart_total),
    })
    .select("id")
    .single();
  if (error) throw error;
  return { cart_event_id: cartEvent.id };
}

async function handleOrder(supabase, data) {
  const orderId = clip(data.order_id, 64);
  if (!orderId) {
    const error = new Error("Missing order");
    error.status = 400;
    throw error;
  }
  const items = Array.isArray(data.items) ? data.items.slice(0, 30) : [];
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_id: orderId,
      session_id: clip(data.session_id, 80) || "anonymous",
      visit_id: await visitIdFor(supabase, data),
      customer_email: clip(data.customer_email, 120),
      subtotal: numberOrNull(data.subtotal) || 0,
      discount_total: numberOrNull(data.discount_total) || 0,
      shipping_total: numberOrNull(data.shipping_total) || 0,
      tax_total: numberOrNull(data.tax_total) || 0,
      total_value: numberOrNull(data.total_value) || 0,
      currency: clip(data.currency, 8) || "USD",
      payment_method: clip(data.payment_method, 40),
      shipping_method: clip(data.shipping_method, 40),
      source: clip(data.source, 80),
      utm_source: clip(data.utm_source, 80),
      utm_medium: clip(data.utm_medium, 80),
      utm_campaign: clip(data.utm_campaign, 80),
      items,
      status: data.status === "pending" ? "pending" : "completed",
    })
    .select("id")
    .single();
  if (error) throw error;
  return { order_id: order.id };
}

async function handleOrderUpdate(supabase, data) {
  const orderId = clip(data.order_id, 64);
  if (!orderId) return { success: false };
  const { data: existing } = await supabase
    .from("orders")
    .select("id, status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!existing) return { success: false, message: "Order not found" };

  const update = { updated_at: new Date().toISOString() };
  const email = clip(data.customer_email, 120);
  if (email) update.customer_email = email;
  if (data.shipping_method) update.shipping_method = clip(data.shipping_method, 40);
  if (data.payment_method) update.payment_method = clip(data.payment_method, 40);
  if (existing.status === "pending" && data.status === "completed") update.status = "completed";

  const { error } = await supabase.from("orders").update(update).eq("id", existing.id);
  if (error) throw error;
  return { success: true };
}

export default withErrors(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = await readJson(req);
  const type = body.type;
  const data = body.data;
  if (!EVENT_TYPES.has(type) || !data || typeof data !== "object") {
    return json({ error: "Unknown event" }, 400);
  }

  const supabase = getAdmin();
  const handlers = {
    visit: handleVisit,
    page_view: handlePageView,
    event: handleEvent,
    cart_event: handleCartEvent,
    order: handleOrder,
    order_update: handleOrderUpdate,
  };
  const result = await handlers[type](supabase, data);
  return json({ success: true, type, ...result });
});
