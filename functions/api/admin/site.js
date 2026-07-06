import { requireAdmin } from "../../_lib/auth.js";
import { defaultSiteData, normalizeSiteData } from "../../_lib/site-data.js";
import { error, json } from "../../_lib/responses.js";

export async function onRequestGet(context) {
  const authError = await requireAdmin(context);
  if (authError) return authError;

  const stored = context.env.SITE_CONTENT
    ? await context.env.SITE_CONTENT.get("site-data", { type: "json" })
    : null;
  return json({ ok: true, data: stored ? normalizeSiteData(stored) : defaultSiteData });
}

export async function onRequestPut(context) {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  if (!context.env.SITE_CONTENT) return error("SITE_CONTENT KV 绑定还没有配置。", 500, { setup: true });

  let body;
  try {
    body = await context.request.json();
  } catch {
    return error("请求格式不正确。", 400);
  }

  const data = normalizeSiteData(body.data || body);
  await context.env.SITE_CONTENT.put("site-data", JSON.stringify(data));
  return json({ ok: true, data });
}
