const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/ogg", "ogv"],
  ["video/quicktime", "mov"],
]);

export function validateMediaFile(file) {
  if (!file || typeof file !== "object" || typeof file.size !== "number") {
    return { ok: false, message: "没有收到文件。" };
  }
  if (file.size <= 0) return { ok: false, message: "文件为空。" };
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "文件太大，请压缩到 100MB 以内再上传。" };
  }
  const ext = allowedTypes.get(file.type);
  if (!ext) {
    return { ok: false, message: "只支持 jpg、png、webp、gif、mp4、webm、ogg、mov。" };
  }
  return { ok: true, ext };
}

export function mediaKey(file, ext) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const random = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const safeName = String(file.name || "upload")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `uploads/${yyyy}/${mm}/${random}${safeName ? `-${safeName}` : ""}.${ext}`;
}

export function mediaHeaders(object, extra = {}) {
  const headers = new Headers(extra);
  if (object && typeof object.writeHttpMetadata === "function") object.writeHttpMetadata(headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/octet-stream");
  if (object?.httpEtag) headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return headers;
}

export function parseRange(rangeHeader, size) {
  if (!rangeHeader) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) return null;

  let start;
  let end;
  if (match[1] === "" && match[2] === "") return null;
  if (match[1] === "") {
    const suffixLength = Number(match[2]);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Number(match[2]);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) return null;
  end = Math.min(end, size - 1);
  return {
    offset: start,
    end,
    length: end - start + 1,
  };
}
