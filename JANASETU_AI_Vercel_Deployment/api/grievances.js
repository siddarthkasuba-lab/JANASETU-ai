import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "../lib/db.js";
import { requireAdmin } from "../lib/admin-auth.js";

const scryptAsync = promisify(scrypt);
function makeRef() {
  return "JNS-" + crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
}
function normalizePhone(value) {
  let phone = String(value || "").replace(/[\s()-]/g, "");
  if (phone.startsWith("+91")) phone = phone.slice(3);
  else if (phone.startsWith("91") && phone.length === 12) phone = phone.slice(2);
  return /^\d{10}$/.test(phone) && /^[6-9]/.test(phone) ? phone : "";
}

export default async function handler(req, res) {
  try {
    const sql = getDb();
    if (req.method === "POST") {
      const b = req.body || {};
      const subject = String(b.subject || "").trim();
      const description = String(b.description || "").trim();
      const category = String(b.category || "").trim();
      const phone = normalizePhone(b.phone);
      const pin = String(b.lookupPin || "");
      if (!phone) return res.status(400).json({ error: "Enter a valid Indian mobile number." });
      if (!/^\d{8}$/.test(pin)) return res.status(400).json({ error: "Create an 8-digit lookup PIN and keep it private. You will need it to recover your reference number." });
      if (subject.length < 4 || subject.length > 120) return res.status(400).json({ error: "Subject must be 4–120 characters." });
      if (description.length < 20 || description.length > 3000) return res.status(400).json({ error: "Description must be 20–3000 characters." });
      const allowedCategories = ["Water & sanitation", "Roads & streetlights", "Certificates & documents", "Public health", "Education", "Electricity", "Other"];
      if (!allowedCategories.includes(category)) return res.status(400).json({ error: "Choose a valid category from the list." });
      const allText = [subject, description, String(b.location || ""), String(b.department || "")].join(" ");
      if (/\b\d{12}\b/.test(allText)) return res.status(400).json({ error: "Please remove sensitive identification numbers before submitting." });

      await sql`ALTER TABLE grievances ADD COLUMN IF NOT EXISTS phone_number TEXT`;
      await sql`ALTER TABLE grievances ADD COLUMN IF NOT EXISTS lookup_pin_salt TEXT`;
      await sql`ALTER TABLE grievances ADD COLUMN IF NOT EXISTS lookup_pin_hash TEXT`;
      const reference = makeRef();
      const salt = randomBytes(16).toString("hex");
      const pinHash = Buffer.from(await scryptAsync(pin, salt, 64)).toString("hex");
      const rows = await sql`
        INSERT INTO grievances (reference,subject,description,category,location,department,status,is_demo,phone_number,lookup_pin_salt,lookup_pin_hash)
        VALUES (${reference},${subject},${description},${category},${String(b.location || "").slice(0,120)},${String(b.department || "").slice(0,120)},'Submitted',TRUE,${phone},${salt},${pinHash})
        RETURNING id,reference,subject,category,location,department,status,created_at,is_demo
      `;
      await sql`INSERT INTO grievance_history (grievance_id,status,note,actor)
        VALUES (${rows[0].id},'Submitted','Demo grievance record created. No government department was contacted.','System')`;
      return res.status(201).json({ grievance: rows[0], message: "Demo grievance created successfully." });
    }
    if (req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      const rows = await sql`SELECT reference,subject,category,location,department,status,created_at,updated_at
        FROM grievances ORDER BY created_at DESC LIMIT 100`;
      return res.status(200).json({ grievances: rows, count: rows.length, demo: true });
    }
    return res.status(405).json({ error: "Method not allowed." });
  } catch (e) {
    console.error("Grievance API failed:", e);
    return res.status(e.statusCode || 500).json({ error: e.statusCode ? e.message : "Unable to process grievance. Please try again." });
  }
}
