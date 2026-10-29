import test from "node:test";
import assert from "node:assert/strict";
import { requireAdmin } from "../lib/admin-auth.js";

function responseMock() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(key, value) { this.headers[key] = value; }
  };
}

test("admin routes fail closed when the secret is not configured", () => {
  const old = process.env.JANASETU_ADMIN_TOKEN;
  delete process.env.JANASETU_ADMIN_TOKEN;
  const res = responseMock();
  assert.equal(requireAdmin({ headers: {} }, res), false);
  assert.equal(res.statusCode, 503);
  if (old !== undefined) process.env.JANASETU_ADMIN_TOKEN = old;
});

test("admin routes reject a missing or incorrect token", () => {
  const old = process.env.JANASETU_ADMIN_TOKEN;
  process.env.JANASETU_ADMIN_TOKEN = "a".repeat(64);
  const missing = responseMock();
  assert.equal(requireAdmin({ headers: {} }, missing), false);
  assert.equal(missing.statusCode, 401);
  const wrong = responseMock();
  assert.equal(requireAdmin({ headers: { "x-admin-token": "wrong" } }, wrong), false);
  assert.equal(wrong.statusCode, 401);
  if (old === undefined) delete process.env.JANASETU_ADMIN_TOKEN;
  else process.env.JANASETU_ADMIN_TOKEN = old;
});

test("admin routes accept the configured token", () => {
  const old = process.env.JANASETU_ADMIN_TOKEN;
  const token = "b".repeat(64);
  process.env.JANASETU_ADMIN_TOKEN = token;
  const res = responseMock();
  assert.equal(requireAdmin({ headers: { "x-admin-token": token } }, res), true);
  assert.equal(res.statusCode, 200);
  if (old === undefined) delete process.env.JANASETU_ADMIN_TOKEN;
  else process.env.JANASETU_ADMIN_TOKEN = old;
});
