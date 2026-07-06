import { error } from "./responses.js";

const COOKIE_NAME = "curtain_admin_session";
const encoder = new TextEncoder();

function base64Url(bytesOrText) {
  const bytes = typeof bytesOrText === "string" ? encoder.encode(bytesOrText) : bytesOrText;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sha256Hex(text) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64Url(new Uint8Array(signature));
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
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };
  const body = base64Url(JSON.stringify(payload));
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
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return error("登录已过期。", 401);
  } catch {
    return error("登录状态无效。", 401);
  }
  return null;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
