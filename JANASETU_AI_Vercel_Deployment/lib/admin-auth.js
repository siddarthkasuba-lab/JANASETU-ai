import { timingSafeEqual } from "node:crypto";

export function requireAdmin(req, res) {
  const expected = process.env.JANASETU_ADMIN_TOKEN;
  if (!expected || expected.length < 32) {
    res.status(503).json({ error: "Admin access is disabled until JANASETU_ADMIN_TOKEN is configured with a strong secret in the deployment environment." });
    return false;
  }

  const supplied = String(req.headers["x-admin-token"] || "");
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && timingSafeEqual(a, b);
  if (!valid) {
    res.setHeader("WWW-Authenticate", "Bearer");
    res.status(401).json({ error: "Admin authentication required. Enter a valid admin token." });
    return false;
  }
  return true;
}
