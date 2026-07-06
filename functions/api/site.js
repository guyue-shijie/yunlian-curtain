import { defaultSiteData, normalizeSiteData } from "../_lib/site-data.js";
import { json } from "../_lib/responses.js";

export async function onRequestGet({ env }) {
  const stored = env.SITE_CONTENT ? await env.SITE_CONTENT.get("site-data", { type: "json" }) : null;
  const data = stored ? normalizeSiteData(stored) : defaultSiteData;
  return json({ ok: true, data }, { cacheControl: "public, max-age=60" });
}
