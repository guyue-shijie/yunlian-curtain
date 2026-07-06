import { requireAdmin } from "../../_lib/auth.js";
import { mediaKey, validateMediaFile } from "../../_lib/media.js";
import { error, json } from "../../_lib/responses.js";

export async function onRequestPost(context) {
  const authError = await requireAdmin(context);
  if (authError) return authError;
  if (!context.env.SITE_MEDIA) return error("SITE_MEDIA R2 绑定还没有配置。", 500, { setup: true });

  let form;
  try {
    form = await context.request.formData();
  } catch {
    return error("上传格式不正确。", 400);
  }

  const file = form.get("file");
  const validation = validateMediaFile(file);
  if (!validation.ok) return error(validation.message, 400);

  const key = mediaKey(file, validation.ext);
  await context.env.SITE_MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
    },
    customMetadata: {
      originalName: String(file.name || "upload").slice(0, 200),
    },
  });

  return json({
    ok: true,
    file: {
      key,
      url: `/media/${key}`,
      type: file.type,
      size: file.size,
    },
  });
}
