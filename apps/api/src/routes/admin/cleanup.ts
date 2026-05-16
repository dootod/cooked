import { Hono } from "hono";
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { db, medias, steps } from "@cooked/db";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import type { AppEnv } from "../../lib/types.js";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const app = new Hono<AppEnv>();
app.use("*", authMiddleware, adminMiddleware);

app.post("/orphan-uploads", async (c) => {
  let files: string[];
  try {
    files = await readdir(UPLOAD_DIR);
  } catch {
    return c.json({ deleted: 0, message: "Upload directory not found" });
  }

  const [mediaRows, stepRows] = await Promise.all([
    db.select({ url: medias.url }).from(medias),
    db.select({ mediaUrl: steps.mediaUrl }).from(steps),
  ]);

  const referencedFiles = new Set<string>();
  for (const row of mediaRows) {
    const filename = row.url.split("/").pop();
    if (filename) referencedFiles.add(filename);
  }
  for (const row of stepRows) {
    if (row.mediaUrl) {
      const filename = row.mediaUrl.split("/").pop();
      if (filename) referencedFiles.add(filename);
    }
  }

  let deleted = 0;
  for (const file of files) {
    if (!referencedFiles.has(file)) {
      try {
        await unlink(join(UPLOAD_DIR, file));
        deleted++;
      } catch {}
    }
  }

  return c.json({ deleted, total: files.length });
});

export default app;
