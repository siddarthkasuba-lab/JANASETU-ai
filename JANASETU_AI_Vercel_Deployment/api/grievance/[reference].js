import { getDb } from "../../lib/db.js";
import { requireAdmin } from "../../lib/admin-auth.js";

const allowed = ["Submitted", "Under Review", "In Progress", "Action Required", "Resolved", "Closed"];

export default async function handler(req, res) {
  try {
    const sql = getDb();
    const ref = String(req.query.reference || "").trim().toUpperCase();
    if (!/^JNS-[A-F0-9]{8}$/.test(ref)) return res.status(400).json({ error: "Enter a valid reference such as JNS-AB12CD34." });

    if (req.method === "PATCH") {
      if (!requireAdmin(req, res)) return;
      const b = req.body || {};
      const status = String(b.status || "");
      if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status." });
      const rows = await sql`UPDATE grievances SET status=${status},updated_at=NOW()
        WHERE reference=${ref} RETURNING id,reference,status,subject`;
      if (!rows.length) return res.status(404).json({ error: "No demo grievance found for that reference." });
      await sql`INSERT INTO grievance_history (grievance_id,status,note,actor)
        VALUES (${rows[0].id},${status},${String(b.note || "Status updated in demonstration workspace.").slice(0,500)},'Demo admin')`;
      return res.status(200).json({ grievance: rows[0], message: "Status updated in demo workspace." });
    }
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
    const rows = await sql`SELECT id,reference,subject,category,location,department,status,created_at,updated_at,is_demo
      FROM grievances WHERE reference=${ref}`;
    if (!rows.length) return res.status(404).json({ error: "No demo grievance found for that reference." });
    const history = await sql`SELECT status,note,actor,created_at FROM grievance_history
      WHERE grievance_id=${rows[0].id} ORDER BY created_at ASC`;
    return res.status(200).json({ grievance: rows[0], history, demo: true });
  } catch (e) {
    return res.status(e.statusCode || 500).json({ error: e.statusCode ? e.message : "Unable to retrieve this grievance." });
  }
}
