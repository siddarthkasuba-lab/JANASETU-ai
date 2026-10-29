# Testing checklist

Record date, deployment URL, browser, input, expected result, actual result, and screenshot/reference for each run. Do not mark a test passed until you actually run it.

## Automated unit tests

Run `npm test` from `JANASETU_AI_Vercel_Deployment/`. Current unit tests exercise admin authorization with missing, invalid and valid tokens.

## Manual live checks

1. Open production site on mobile and desktop; verify layout and navigation.
2. Load `/api/services`; expect HTTP 200 and service entries.
3. Search streetlights, water, certificates and electricity; verify useful results and official links.
4. Ask an English question; expect an English answer.
5. Ask a Telugu-script question; expect a Telugu answer.
6. If available, test both microphone buttons in a supported browser; confirm transcript appears before submission. Deny permission once to verify the fallback message.
7. Submit a synthetic grievance with valid fields; expect HTTP 201 and a reference.
8. Try a short subject, short description, missing category, and a 12-digit sequence; expect HTTP 400.
9. Track the created reference; verify status and initial history.
10. Request a malformed reference; expect HTTP 400. Request a valid-format unknown reference; expect HTTP 404.
11. Call `GET /api/grievances` without an admin token; expect HTTP 401, or HTTP 503 if the admin secret is not configured.
12. Attempt a status PATCH without a token; expect HTTP 401, or HTTP 503 if not configured.
13. Configure a strong `JANASETU_ADMIN_TOKEN` only in Vercel/local environment. With the correct token, verify admin listing and status update; with a wrong token, verify rejection.
14. Check Vercel function logs for errors. Never capture environment variables or secrets in evidence.
15. Confirm the final deployment is public to evaluators and all links in README/PPT work.

## Test data and safety

Use synthetic demo data only. Do not use real names, Aadhaar numbers, phone numbers, addresses, or other sensitive information in the demo database.
