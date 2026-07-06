import { clearSessionCookie } from "../_lib/auth.js";
import { json } from "../_lib/responses.js";

export async function onRequestPost() {
  return json(
    { ok: true },
    {
      headers: {
        "set-cookie": clearSessionCookie(),
      },
    },
  );
}
