import { Hono } from "hono";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import type { AppEnv } from "../../lib/types.js";

const UPLOAD_DIR = join(process.cwd(), "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const app = new Hono<AppEnv>();
app.use("*", authMiddleware, adminMiddleware);

app.post("/", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return c.json({ error: "Aucun fichier envoye" }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: "Format non supporte (JPEG, PNG, WebP, AVIF)" }, 400);
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: "Fichier trop volumineux (max 5 Mo)" }, 400);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const baseUrl = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
  const url = `${baseUrl}/uploads/${filename}`;

  return c.json({ url, filename }, 201);
});

export default app;
