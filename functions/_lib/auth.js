import { error } from "./responses.js";

const COOKIE_NAME = "curtain_admin_session";

function utf8Bytes(text) {
  const value = String(text || "");
  const bytes = [];
  for (let i = 0; i < value.length; i += 1) {
    let code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < value.length) {
      const next = value.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i += 1;
      }
    }
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return new Uint8Array(bytes);
}

function hex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text) {
  const hash = await crypto.subtle.digest("SHA-256", utf8Bytes(text));
  return hex(hash);
}

function constantEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function hmac(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8Bytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, utf8Bytes(data));
  return hex(signature);
}

function parseCookies(request) {
  const header = request.headers.get("cookie") || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return index === -1 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

export async function verifyPassword(env, password) {
  const plain = env.ADMIN_PASSWORD;
  const configuredHash = env.ADMIN_PASSWORD_HASH;
  if (!plain && !configuredHash) {
    return { ok: false, setup: true, message: "后台密码还没有配置，请先在 Cloudflare 设置 ADMIN_PASSWORD。" };
  }
  const expected = configuredHash || (await sha256Hex(plain));
  const actual = await sha256Hex(password || "");
  return { ok: constantEqual(actual, expected) };
}

export async function createSessionCookie(env) {
  const secret = env.SESSION_SECRET;
  if (!secret || secret.length < 24) {
    return { ok: false, message: "SESSION_SECRET 还没有配置，至少 24 个字符。" };
  }
  const body = String(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7);
  const signature = await hmac(body, secret);
  return {
    ok: true,
    header: `${COOKIE_NAME}=${body}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
  };
}

export async function requireAdmin({ request, env }) {
  const secret = env.SESSION_SECRET;
  if (!secret) return error("SESSION_SECRET 还没有配置。", 500);
  const cookies = parseCookies(request);
  const token = cookies[COOKIE_NAME];
  if (!token) return error("未登录。", 401);
  const [body, signature] = token.split(".");
  if (!body || !signature) return error("登录状态无效。", 401);
  const expected = await hmac(body, secret);
  if (!constantEqual(signature, expected)) return error("登录状态无效。", 401);
  const expiresAt = Number(body);
  if (!Number.isFinite(expiresAt)) return error("登录状态无效。", 401);
  if (expiresAt < Math.floor(Date.now() / 1000)) return error("登录已过期。", 401);
  return null;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
