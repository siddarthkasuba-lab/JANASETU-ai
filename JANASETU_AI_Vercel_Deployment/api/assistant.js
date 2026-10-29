import { getDb } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const message = String((req.body || {}).message || "").trim().slice(0, 1500);
  if (message.length < 3) return res.status(400).json({ error: "Please describe your question in a little more detail." });

  try {
    const sql = getDb();
    // Load the small curated directory and rank each service against individual
    // query terms. Requiring several words to occur in the same column caused
    // valid queries such as "streetlight not working" to return no matches.
    const directory = await sql`SELECT title,category,description,documents,steps,official_url,reviewed_on
      FROM services
      ORDER BY title LIMIT 100`;
    const lowerMessage = message.toLowerCase();
    // The current directory is English, so add simple keyword bridges for
    // common Telugu public-service requests before ranking the records.
    const teluguTerms = [];
    if (/వీధి\s*దీపం|వీధి\s*లైట్|స్ట్రీట్\s*లైట్|దీపాలు/.test(lowerMessage)) {
      teluguTerms.push("streetlight", "road");
    }
    if (/నీటి\s*సరఫరా|నీళ్లు|తాగునీరు|నీరు\s*రావడం\s*లేదు/.test(lowerMessage)) {
      teluguTerms.push("water", "supply");
    }
    if (/సర్టిఫికెట్|సర్టిఫికేట్|జనన\s*ధృవీకరణ|పుట్టిన\s*తేదీ/.test(lowerMessage)) {
      teluguTerms.push("certificate", "documents");
    }
    if (/విద్యుత్|కరెంట్|కరెంటు/.test(lowerMessage)) {
      teluguTerms.push("electricity", "supply");
    }
    const normalizedMessage = (lowerMessage + " " + teluguTerms.join(" "))
      .replace(/street\s*lights?/g, "streetlight")
      .replace(/streetlights?/g, "streetlight")
      .replace(/[^a-z0-9\s]/g, " ");
    const stopWords = new Set(["about","after","again","been","being","could","does","from","have","help","into","near","need","please","should","that","their","there","these","they","this","through","what","when","where","which","while","with","would","working","issue","problem","report","days","several"]);
    const terms = [...new Set(normalizedMessage.split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w)))];
    const scored = directory.map(service => {
      const title = String(service.title || "").toLowerCase().replace(/street\s*lights?/g, "streetlight").replace(/[^a-z0-9\s]/g, " ");
      const category = String(service.category || "").toLowerCase().replace(/street\s*lights?/g, "streetlight").replace(/[^a-z0-9\s]/g, " ");
      const description = String(service.description || "").toLowerCase().replace(/street\s*lights?/g, "streetlight").replace(/[^a-z0-9\s]/g, " ");
      const haystack = title + " " + category + " " + description;
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 5;
        else if (category.includes(term)) score += 4;
        else if (description.includes(term)) score += 1;
      }
      if (normalizedMessage.includes("streetlight") &&
          (title.includes("streetlight") || category.includes("streetlight") || description.includes("streetlight"))) score += 10;
      if ((normalizedMessage.includes("road") || normalizedMessage.includes("streetlight")) &&
          (title.includes("road") || category.includes("road"))) score += 2;
      return { service, score, haystack };
    }).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    const context = scored.map(item => item.service);

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              { role: "system", content: "You are JANASETU, a cautious public-service guide for an Indian citizen-services prototype. If the user asks in Telugu, answer fully in natural Telugu; if the user asks in English, answer in English. Use only supplied service records for specific government requirements. Never invent eligibility, fees, deadlines, contacts, official submission, or case status. If uncertain, say so and point to an official department website. State that this demo does not file official complaints. Be concise and accessible." },
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
    const isTelugu = /[\u0C00-\u0C7F]/.test(message);
    const answer = isTelugu
      ? (context.length
        ? `మీ ప్రశ్నకు సంబంధించిన సేవా మార్గదర్శకం: ${context.map(s => `${s.title}. ${s.title.toLowerCase().includes("streetlight") || s.title.toLowerCase().includes("road") ? "వీధి దీపం లేదా రహదారి సమస్యను సంబంధిత స్థానిక అధికారికి తెలియజేయండి." : s.title.toLowerCase().includes("water") ? "నీటి సరఫరా సమస్యను మీ స్థానిక నీటి సరఫరా లేదా మున్సిపల్ అధికారికి తెలియజేయండి." : s.title.toLowerCase().includes("certificate") || s.title.toLowerCase().includes("document") ? "అవసరమైన పత్రాలు మరియు దరఖాస్తు విధానాన్ని అధికారిక వెబ్‌సైట్‌లో నిర్ధారించండి." : "తదుపరి చర్యలు మరియు అవసరాలను సంబంధిత అధికారిక వెబ్‌సైట్‌లో నిర్ధారించండి."}`).join("\n\n")}\n\nదయచేసి తాజా వివరాలను అధికారిక వెబ్‌సైట్‌లో నిర్ధారించండి. ఇది డెమో మాత్రమే; ఈ ప్రోటోటైప్ ద్వారా ప్రభుత్వానికి అధికారిక ఫిర్యాదు పంపబడదు.`
        : "క్షమించండి, ప్రస్తుతం మీ ప్రశ్నకు సరిపోయే సేవా మార్గదర్శకం కనుగొనలేకపోయాను. సంబంధిత ప్రభుత్వ శాఖ అధికారిక వెబ్‌సైట్‌ను చూడండి. ఈ ప్రోటోటైప్ ద్వారా అధికారిక ఫిర్యాదు పంపబడదు.")
      : (context.length
        ? `I found a potentially relevant service guide: ${context.map(s => `${s.title} — ${s.description} Next step: ${s.steps}`).join("\n\n")} Please verify current requirements on the official website. This prototype does not file an official government complaint.`
        : "I could not find a matching service guide in the current directory. Please check the relevant official department website. This prototype does not file an official government complaint.");
    return res.status(200).json({
      answer,
      sources: context.filter(s => s.official_url).map(s => ({ title: s.title, url: s.official_url, reviewed_on: s.reviewed_on })),
      verified_fromDirectory: context.length > 0, demo: true
    });
  } catch (e) {
    return res.status(e.statusCode || 500).json({ error: e.statusCode ? e.message : "AI guidance is temporarily unavailable. You can still browse the service directory and prepare a demo grievance.", fallback: true });
  }
}
