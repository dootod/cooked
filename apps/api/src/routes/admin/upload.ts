import { Hono } from "hono";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import type { AppEnv } from "../../lib/types.js";

const UPLOAD_DIR = join(process.cwd(), "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

const MAGIC_BYTES: Record<string, number[]> = {
  jpg: [0xff, 0xd8, 0xff],
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46],
  avif: [0x00, 0x00, 0x00],
};

function validateMagicBytes(buffer: Buffer, ext: string): boolean {
  const expected = MAGIC_BYTES[ext];
  if (!expected) return false;
  if (buffer.length < expected.length) return false;
  if (ext === "avif") {
    const ftypSlice = buffer.subarray(4, 8).toString("ascii");
    return ftypSlice === "ftyp";
  }
  return expected.every((byte, i) => buffer[i] === byte);
}

const app = new Hono<AppEnv>();
app.use("*", authMiddleware, adminMiddleware);

app.post("/", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return c.json({ error: "Aucun fichier envoye" }, 400);
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: "Fichier trop volumineux (max 5 Mo)" }, 400);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return c.json({ error: "Extension non supportee (jpg, png, webp, avif)" }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!validateMagicBytes(buffer, ext)) {
    return c.json({ error: "Contenu du fichier invalide" }, 400);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);

  const baseUrl = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
  const url = `${baseUrl}/uploads/${filename}`;

  return c.json({ url, filename }, 201);
});

export default app;
