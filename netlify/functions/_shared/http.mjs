export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function withErrors(handler) {
  return async (req) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
    try {
      return await handler(req);
    } catch (error) {
      const status = Number(error?.status) || 500;
      console.error(error);
      return json(
        { error: status >= 500 ? "Something went wrong" : error.message },
        status
      );
    }
  };
}

export async function readJson(req) {
  const text = await req.text();
  if (text.length > 100000) {
    const error = new Error("Request is too large");
    error.status = 413;
    throw error;
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("Invalid JSON");
    error.status = 400;
    throw error;
  }
}

export function clip(value, max) {
  if (value == null) return null;
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.slice(0, max);
}

export function requestOrigin(req) {
  const origin = req.headers.get("origin");
  if (origin && /^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin)) return origin;
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return "";
    }
  }
  return process.env.URL || process.env.DEPLOY_PRIME_URL || "";
}
