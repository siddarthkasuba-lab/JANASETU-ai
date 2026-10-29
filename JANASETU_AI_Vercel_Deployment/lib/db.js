import { neon } from "@neondatabase/serverless";

export function getDb() {
  if (!process.env.DATABASE_URL) {
    const error = new Error("DATABASE_URL is not configured. Add it in Vercel Environment Variables.");
    error.statusCode = 503;
    throw error;
  }
  return neon(process.env.DATABASE_URL);
}

export function jsonError(res, status, message) {
  return res.status(status).json({ error: message });
}
