import { createHash, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "../lib/db.js";

const scryptAsync = promisify(scrypt);
const PIN_PATTERN = /^\d{8}$/;
const PHONE_PATTERN = /^\d{10}$/;
const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

function normalizePhone(value) {
  let phone = String(value || "").replace(/[\s()-]/g, "");
  if (phone.startsWith("+91")) phone = phone.slice(3);
  else if (phone.startsWith("91") && phone.length === 12) phone = phone.slice(2);
  return PHONE_PATTERN.test(phone) && /^[6-9]/.test(phone) ? phone : "";
}

function sha(value) {
  return createHash("sha256").update(value).digest("hex");
}

function getClientIp(req) {
  const value = String(req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"] || "");
  return value.split(",").map(part => part.trim()).filter(Boolean).pop() || "unknown";
}

async function verifyPin(pin, salt, expectedHex) {
  const actual = Buffer.from(await scryptAsync(pin, salt, 64));
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const body = req.body || {};
    const phone = normalizePhone(body.phone);
    const pin = String(body.pin || "");
    if (!phone || !PIN_PATTERN.test(pin)) {
      return res.status(400).json({ error: "Enter a valid Indian mobile number and the 8-digit lookup PIN you created when submitting the demo grievance." });
    }

    const sql = getDb();
    await sql`ALTER TABLE grievances ADD COLUMN IF NOT EXISTS phone_number TEXT`;
    await sql`ALTER TABLE grievances ADD COLUMN IF NOT EXISTS lookup_pin_salt TEXT`;
    await sql`ALTER TABLE grievances ADD COLUMN IF NOT EXISTS lookup_pin_hash TEXT`;
    await sql`CREATE TABLE IF NOT EXISTS grievance_lookup_attempts (
      id BIGSERIAL PRIMARY KEY,
      phone_hash TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS grievance_lookup_attempts_time_idx ON grievance_lookup_attempts (attempted_at)`;

    const phoneHash = sha(phone);
    const ipHash = sha(getClientIp(req));
    const recent = await sql`SELECT COUNT(*)::int AS count FROM grievance_lookup_attempts
      WHERE phone_hash = ${phoneHash} AND ip_hash = ${ipHash}
      AND attempted_at > NOW() - INTERVAL '15 minutes'`;
    if (recent[0].count >= MAX_ATTEMPTS) {
      res.setHeader("Retry-After", String(WINDOW_MINUTES * 60));
      return res.status(429).json({ error: "Too many lookup attempts. Please wait 15 minutes before trying again." });
    }
    await sql`INSERT INTO grievance_lookup_attempts (phone_hash, ip_hash) VALUES (${phoneHash}, ${ipHash})`;

    const rows = await sql`SELECT reference, subject, status, created_at, lookup_pin_salt, lookup_pin_hash
      FROM grievances WHERE phone_number = ${phone} AND is_demo = TRUE
      ORDER BY created_at DESC LIMIT 100`;
    const matches = [];
    for (const row of rows) {
      if (row.lookup_pin_salt && row.lookup_pin_hash && await verifyPin(pin, row.lookup_pin_salt, row.lookup_pin_hash)) {
        matches.push({ reference: row.reference, subject: row.subject, status: row.status, created_at: row.created_at });
      }
    }

    if (!matches.length) {
      return res.status(401).json({ error: "We couldn't find a matching demo grievance. Check your mobile number and 8-digit lookup PIN." });
    }
    return res.status(200).json({
      grievances: matches,
      demo: true,
      message: "These are demo records only; no government department was contacted."
    });
  } catch (error) {
    console.error("Grievance reference lookup failed:", error);
    return res.status(500).json({ error: "Unable to look up your demo references right now. Please try again later." });
  }
}
