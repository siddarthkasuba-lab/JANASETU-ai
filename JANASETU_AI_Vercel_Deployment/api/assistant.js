import { getDb } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const message = String((req.body || {}).message || "").trim().slice(0, 1500);
  if (message.length < 3) return res.status(400).json({ error: "Please describe your question in a little more detail." });

  try {
    const sql = getDb();
    const words = message.split(/\s+/).filter(w => w.length > 4).slice(0, 2);
    const pattern = "%" + words.join("%") + "%";
    const context = await sql`SELECT title,category,description,documents,steps,official_url,reviewed_on
      FROM services
      WHERE title ILIKE ${pattern} OR category ILIKE ${pattern} OR description ILIKE ${pattern}
      ORDER BY title LIMIT 5`;

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              { role: "system", content: "You are JANASETU, a cautious public-service guide for an Indian citizen-services prototype. Use only supplied service records for specific government requirements. Never invent eligibility, fees, deadlines, contacts, official submission, or case status. If uncertain, say so and point to an official department website. State that this demo does not file official complaints. Be concise, accessible, and mirror Telugu if possible." },
              { role: "user", content: `Question: ${message}\nCurated service records: ${JSON.stringify(context)}` }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          return res.status(200).json({
            answer: data.choices?.[0]?.message?.content || "I could not verify an answer. Please check the relevant official source.",
            sources: context.filter(s => s.official_url).map(s => ({ title: s.title, url: s.official_url, reviewed_on: s.reviewed_on })),
            verified_fromDirectory: context.length > 0, demo: true
          });
        }
      } catch (_) {}
    }
    const answer = context.length
      ? `I found a potentially relevant service guide: ${context.map(s => `${s.title} — ${s.description} Next step: ${s.steps}`).join("\n\n")} Please verify current requirements on the official website. This prototype does not file an official government complaint.`
      : "I could not find a matching service guide in the current directory. Please check the relevant official department website. This prototype does not file an official government complaint.";
    return res.status(200).json({
      answer,
      sources: context.filter(s => s.official_url).map(s => ({ title: s.title, url: s.official_url, reviewed_on: s.reviewed_on })),
      verified_fromDirectory: context.length > 0, demo: true
    });
  } catch (e) {
    return res.status(e.statusCode || 500).json({ error: e.statusCode ? e.message : "AI guidance is temporarily unavailable. You can still browse the service directory and prepare a demo grievance.", fallback: true });
  }
}
