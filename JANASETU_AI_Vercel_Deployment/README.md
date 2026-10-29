# JANASETU AI — Vercel deployment package

**Team:** Alpha Intelligence  
**Hackathon:** HACK-P438 — Public Grievance AI Assistant

A Vercel-compatible conversion of the JANASETU AI student prototype. The website runs on Vercel and the API uses PostgreSQL through Neon (or another PostgreSQL provider compatible with `DATABASE_URL`).

## Features
- Public-service directory with curated starter entries
- AI guidance endpoint (optional OpenAI-compatible API key; safe fallback if not configured)
- Demo grievance creation and reference tracking
- Demo history/status updates
- Team details page

## Deploy to GitHub and Vercel
1. Extract this ZIP.
2. Create a new GitHub repository and upload/push the extracted files.
3. In Vercel, choose **Add New → Project**, import that repository, and deploy.
4. Create a PostgreSQL database (Neon is a simple option).
5. In Vercel → **Project → Settings → Environment Variables**, add:
   - `DATABASE_URL` — PostgreSQL connection string
   - `OPENAI_API_KEY` — optional; needed for AI-generated answers
   - `OPENAI_MODEL` — optional; defaults to `gpt-4o-mini`
6. Redeploy after setting environment variables.
7. Initialize the database once by running the SQL in `db/schema.sql` in your database SQL editor.

## Local development
```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL
npm run dev
```

## Important
- This is a **student demonstration prototype**, not an official government website or complaint-filing channel.
- Grievances created here are demo records only. No government department is contacted.
- Before public use, add proper staff/admin authentication, rate limiting, abuse protection, data-retention controls, and security review. The demo status update endpoint is intentionally not suitable for real citizen data.
- Do not commit `.env` or real API keys to GitHub.
