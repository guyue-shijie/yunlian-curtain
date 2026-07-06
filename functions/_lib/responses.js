export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", init.cacheControl || "no-store");
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function error(message, status = 400, extra = {}) {
  return json({ ok: false, error: message, ...extra }, { status });
}
