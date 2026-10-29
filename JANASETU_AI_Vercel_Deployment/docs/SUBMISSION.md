# Final submission checklist — JANASETU AI

Problem statement: **HACK-P438 — Public Grievance AI Assistant**  
Team: **Alpha Intelligence**  
Course context: Backend Web Development  
Live app (verify latest deployment before submission): https://janasetu-ai-rosy.vercel.app/

## Deliverables checklist

- [x] GitHub source repository: https://github.com/siddarthkasuba-lab/JANASETU-ai
- [x] Live deployment exists (recheck after latest commits).
- [x] README with setup, environment variables, architecture, limitations and API documentation links.
- [x] API endpoint documentation: [API.md](API.md)
- [x] Architecture and database relationship documentation: [architecture.md](architecture.md)
- [x] Manual test checklist: [TESTING.md](TESTING.md)
- [x] Automated Node.js tests and GitHub Actions syntax/test workflow.
- [ ] Set `JANASETU_ADMIN_TOKEN` in Vercel Production, Preview and Development environments as appropriate; redeploy; test correct and incorrect tokens.
- [ ] Confirm Vercel production deployment is Ready after the latest commit.
- [ ] Capture real screenshots from the final deployed application.
- [ ] Capture sanitized Postman/API request and error-response evidence.
- [ ] Add the final ER diagram/schema screenshot if the instructor expects a visual.
- [ ] Record and upload the actual 3–5 minute demo video; verify evaluator access.
- [ ] Review and finalize the PowerPoint with the current deployment URL, screenshots, test evidence and truthful limitations.
- [ ] Confirm all team details and each member's actual contribution.
- [ ] Verify all submission links open without requiring personal account access.

## Team details to verify

| Name | Roll number | Branch | Section |
|---|---|---|---|
| Kasuba Siddarth (Team Lead) | 25MVADSR0046 | AI&DS | S03 |
| Kochidige Nikil | 25MVADSR0048 | AI&DS | S03 |
| Busam Akshay | 25MVADSR0013 | AI&DS | S03 |
| Nagapuri Veera Venkata Akash | 25MVADSR0071 | AI&DS | S03 |

Before submitting, verify spelling and all identifiers against the official class/team records. Add only contributions that each member actually completed; do not invent task allocations.

## Suggested 3–5 minute demo video

**0:00–0:25 — Introduction**
- Introduce JANASETU AI, HACK-P438 and Alpha Intelligence.
- State clearly that it is a student prototype, not an official filing channel.

**0:25–1:10 — Service directory**
- Search for streetlights, water supply or certificate guidance.
- Open an official resource link and explain that current requirements must be verified on the official site.

**1:10–1:45 — Assistant**
- Ask one English question and one Telugu question.
- If microphone input is working on the test device, demonstrate it; otherwise omit the microphone demonstration rather than pretending it worked.
- Show the source links and explain the optional AI-provider/fallback behavior.

**1:45–2:35 — Grievance workflow**
- Submit a synthetic example only.
- Show the generated reference, then track it and show its history.
- Repeat that the record is only in the demo database and no government department was contacted.

**2:35–3:35 — Backend/database/testing**
- Show `GET /api/services`, a safe validation error, and the automated GitHub Actions success result.
- If admin token is configured, show authorized status update and rejection without a token. Never show the token itself.
- Show database schema tables without exposing credentials or real personal data.

**3:35–4:00 — Deployment and limitations**
- Show the live URL, architecture, and the current limitations.
- Conclude with future work: staff accounts, rate limiting, audit logging and authorized integrations.

## PowerPoint outline (8–12 slides)

1. Title, problem ID, team and verified team details.
2. Problem statement and target users.
3. Objectives and proposed solution.
4. Features actually implemented.
5. Technology stack.
6. Architecture diagram.
7. Backend API, validation, error handling and admin authorization.
8. Database schema/ER diagram.
9. Real screenshots of the deployed workflows.
10. Testing methods and observed results.
11. Deployment, challenges and limitations.
12. Conclusion and future scope.

Only include test results you have actually observed on the final deployed version. Do not expose API keys, database URLs, admin tokens, or personal citizen data.
