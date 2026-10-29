# JANASETU AI API reference

Base URL: `https://janasetu-ai-rosy.vercel.app` (verify the current production domain before submission).

All responses are JSON. Examples use synthetic values only.

## GET /api/services

Returns the curated service directory. Optional query parameters: `q` (up to 100 characters) and `category` (up to 80 characters).

Example: `{ "services": [], "count": 0 }`

## POST /api/assistant

Body: `{ "message": "My streetlight is not working" }`

Requires a message of at least 3 characters. Response includes `answer`, `sources`, `verified_fromDirectory`, and `demo`. The optional AI provider is configured through server-side environment variables. Fallback guidance is directory-based and should not be represented as a guaranteed AI-generated answer.

## POST /api/grievances

Creates a **demo-only** grievance. Required fields: `subject` (4–120 chars), `description` (20–3000 chars), and `category` (1–80 chars). Optional `location` and `department` are limited to 120 characters. The current API rejects a 12-digit sequence in subject/description as a basic safeguard.

Example request:
```json
{
  "subject": "Street light not working",
  "description": "The street light near the community park has not worked for several days.",
  "category": "Roads & streetlights",
  "location": "Demo locality",
  "department": "Local municipal office"
}
```
Success: HTTP 201 with `grievance.reference`. Invalid input returns HTTP 400. No government department is contacted.

## GET /api/grievance/{reference}

Retrieves a demo grievance and its history by reference. Reference format currently accepts `JNS-` followed by 8 hexadecimal characters. Success: HTTP 200. Invalid format: HTTP 400. Unknown reference: HTTP 404. The response is limited to tracking fields and does not return the description.

## GET /api/grievances (admin)

Returns the latest demo records. Requires the `x-admin-token` request header matching the server-side `JANASETU_ADMIN_TOKEN`. Without valid configuration the endpoint fails closed with HTTP 503; without a valid token it returns HTTP 401.

## PATCH /api/grievance/{reference} (admin)

Updates a demo status and appends a history record. Requires `x-admin-token`.

Body: `{ "status": "Under Review", "note": "Reviewed in the demo workspace." }`

Allowed statuses: `Submitted`, `Under Review`, `In Progress`, `Action Required`, `Resolved`, `Closed`. Invalid status returns HTTP 400. This endpoint changes only the prototype record.

## General errors

- HTTP 400: invalid input
- HTTP 401: missing/invalid admin token
- HTTP 404: reference not found
- HTTP 405: method not allowed
- HTTP 503: required database/admin configuration missing
- HTTP 500: unexpected server error

Do not expose secrets in screenshots or include them in Postman collections. Confirm actual live response codes before using them as final testing evidence.
