import { createSessionCookie, verifyPassword } from "../_lib/auth.js";
import { error, json } from "../_lib/responses.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error("请求格式不正确。", 400);
  }

  const result = await verifyPassword(env, body.password);
  if (result.setup) return error(result.message, 500, { setup: true });
  if (!result.ok) return error("密码错误。", 401);

  const cookie = await createSessionCookie(env);
  if (!cookie.ok) return error(cookie.message, 500, { setup: true });

  return json(
    { ok: true },
    {
      headers: {
        "set-cookie": cookie.header,
      },
    },
  );
}
