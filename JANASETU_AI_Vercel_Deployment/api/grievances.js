import { getDb } from "../lib/db.js";
import { requireAdmin } from "../lib/admin-auth.js";

function makeRef() {
  return "JNS-" + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

export default async function handler(req, res) {
  try {
    const sql = getDb();
    if (req.method === "POST") {
      const b = req.body || {};
      const subject = String(b.subject || "").trim();
      const description = String(b.description || "").trim();
      const category = String(b.category || "").trim();
      if (subject.length < 4 || subject.length > 120) return res.status(400).json({ error: "Subject must be 4–120 characters." });
      if (description.length < 20 || description.length > 3000) return res.status(400).json({ error: "Description must be 20–3000 characters." });
      if (!category || category.length > 80) return res.status(400).json({ error: "Choose a valid category." });
      if (/\b\d{12}\b/.test(subject + " " + description)) return res.status(400).json({ error: "Please remove sensitive identification numbers before submitting." });
      const reference = makeRef();
      const rows = await sql`
        INSERT INTO grievances (reference,subject,description,category,location,department,status,is_demo)
        VALUES (${reference},${subject},${description},${category},${String(b.location || "").slice(0,120)},${String(b.department || "").slice(0,120)},'Submitted',TRUE)
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
    return res.status(e.statusCode || 500).json({ error: e.statusCode ? e.message : "Unable to process grievance. Please try again." });
  }
}
