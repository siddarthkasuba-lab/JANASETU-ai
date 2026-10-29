import { getDb } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  try {
    const sql = getDb();
    const q = String(req.query.q || "").trim().slice(0, 100);
    const category = String(req.query.category || "").trim().slice(0, 80);
    const rows = await sql`
      SELECT id,title,category,description,documents,steps,official_url,
             reviewed_on,icon
      FROM services
      WHERE (${q} = '' OR title ILIKE ${'%' + q + '%'} OR description ILIKE ${'%' + q + '%'} OR category ILIKE ${'%' + q + '%'})
        AND (${category} = '' OR category = ${category})
      ORDER BY category,title
    `;
    return res.status(200).json({ services: rows, count: rows.length });
  } catch (e) {
    return res.status(e.statusCode || 500).json({ error: e.statusCode ? e.message : "Could not load service directory." });
  }
}
