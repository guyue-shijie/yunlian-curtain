import { mediaHeaders, parseRange } from "../_lib/media.js";

function mediaPath(params) {
  const path = params.path;
  const value = Array.isArray(path) ? path.join("/") : String(path || "");
  if (!value || value.includes("..") || value.startsWith("/")) return "";
  return value;
}

export async function onRequestGet({ request, env, params }) {
  if (!env.SITE_MEDIA) return new Response("SITE_MEDIA R2 binding is not configured.", { status: 500 });

  const key = mediaPath(params);
  if (!key) return new Response("Not found.", { status: 404 });

  const metadata = await env.SITE_MEDIA.head(key);
  if (!metadata) return new Response("Not found.", { status: 404 });

  const range = parseRange(request.headers.get("range"), metadata.size);
  if (range) {
    const object = await env.SITE_MEDIA.get(key, {
      range: { offset: range.offset, length: range.length },
    });
    if (!object) return new Response("Not found.", { status: 404 });

    const headers = mediaHeaders(metadata, {
      "content-length": String(range.length),
      "content-range": `bytes ${range.offset}-${range.end}/${metadata.size}`,
    });
    return new Response(object.body, { status: 206, headers });
  }

  const object = await env.SITE_MEDIA.get(key);
  if (!object) return new Response("Not found.", { status: 404 });

  const headers = mediaHeaders(object, {
    "content-length": String(metadata.size),
  });
  return new Response(object.body, { headers });
}

export async function onRequestHead({ env, params }) {
  if (!env.SITE_MEDIA) return new Response(null, { status: 500 });
  const key = mediaPath(params);
  if (!key) return new Response(null, { status: 404 });
  const metadata = await env.SITE_MEDIA.head(key);
  if (!metadata) return new Response(null, { status: 404 });
  const headers = mediaHeaders(metadata, {
    "content-length": String(metadata.size),
  });
  return new Response(null, { headers });
}
