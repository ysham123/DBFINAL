const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

process.env.JWT_SECRET = "local-api-test-secret-with-at-least-32-characters";
let base;
let server;
let uploadDir;
let query;
let acquire;
const database = {
  query: (...args) => query(...args),
  getConnection: () => acquire(),
  end: async () => {},
};
require.cache[require.resolve("../config/database")] = { exports: database };
const token = (admin = false) =>
  jwt.sign(
    {
      client_id: 2,
      email: admin ? "anna@cleaningservices.com" : "client@example.com",
    },
    process.env.JWT_SECRET,
  );
const headers = (admin = false) => ({
  Authorization: "Bearer " + token(admin),
  "Content-Type": "application/json",
});
const request = (url, body, admin = false, method = "POST") =>
  fetch(base + url, {
    method,
    headers: headers(admin),
    body: JSON.stringify(body),
  });

before(async () => {
  uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), "cleaning-api-test-"));
  process.env.UPLOAD_PATH = uploadDir;
  const { app } = require("../server");
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
beforeEach(() => {
  query = async () => [[]];
  acquire = async () => {
    throw new Error("Database offline");
  };
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(uploadDir, { recursive: true, force: true });
});

test("protected routes reject absent and expired sessions with 401", async () => {
  assert.equal((await fetch(base + "/api/requests/my-requests")).status, 401);
  const expired = jwt.sign({ client_id: 2 }, process.env.JWT_SECRET, {
    expiresIn: -1,
  });
  assert.equal(
    (
      await fetch(base + "/api/requests/my-requests", {
        headers: { Authorization: "Bearer " + expired },
      })
    ).status,
    401,
  );
});

test("client cannot access admin routes", async () => {
  assert.equal(
    (await fetch(base + "/api/requests/all", { headers: headers() })).status,
    403,
  );
});

test("registration returns a useful validation message and reserves the admin email", async () => {
  const invalid = await request("/api/auth/register", { email: "bad" });
  assert.equal(invalid.status, 400);
  assert.match((await invalid.json()).error, /email/);
  const reserved = await request("/api/auth/register", {
    email: "anna@cleaningservices.com",
    password: "test-password",
    first_name: "Anna",
    last_name: "Johnson",
    address: "1 Main St",
    phone_number: "5551234567",
  });
  assert.equal(reserved.status, 403);
});

test("rejects invalid request fields before opening a transaction", async () => {
  const response = await request("/api/requests", {
    service_address: "1 Main St",
    cleaning_type: "basic",
    num_rooms: 0,
    proposed_budget: -10,
    preferred_datetime: "bad",
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /rooms/);
});

test("connection failures return JSON instead of leaving requests hanging", async () => {
  const response = await request("/api/requests", {
    service_address: "1 Main St",
    cleaning_type: "basic",
    num_rooms: 2,
    proposed_budget: 100,
    preferred_datetime: "2026-10-01T10:00",
  });
  assert.equal(response.status, 500);
  assert.equal((await response.json()).error, "Failed to submit request");
});

test("rejects invalid bill amounts and empty dispute notes", async () => {
  assert.equal(
    (await request("/api/bills", { order_id: 1, amount: -5 }, true)).status,
    400,
  );
  assert.equal(
    (
      await request(
        "/api/bills/1/dispute",
        { dispute_note: " " },
        false,
        "PATCH",
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        "/api/bills/1/revise",
        { revised_amount: 5, revision_note: "" },
        true,
        "PATCH",
      )
    ).status,
    400,
  );
});

test("quote acceptance refuses a quote that has already been answered", async () => {
  let released = false;
  let rolledBack = false;
  acquire = async () => ({
    beginTransaction: async () => {},
    query: async () => [
      [
        {
          client_id: 2,
          request_id: 1,
          client_response: "accepted",
          request_status: "accepted",
        },
      ],
    ],
    rollback: async () => {
      rolledBack = true;
    },
    release: () => {
      released = true;
    },
  });
  const response = await request(
    "/api/quotes/1/respond",
    { response: "accepted" },
    false,
    "PATCH",
  );
  assert.equal(response.status, 409);
  assert.ok(released && rolledBack);
});

test("successful quote acceptance creates one order and commits", async () => {
  const calls = [];
  acquire = async () => ({
    beginTransaction: async () => calls.push("begin"),
    query: async (sql) => {
      calls.push(sql);
      return sql.startsWith("SELECT")
        ? [
            [
              {
                client_id: 2,
                request_id: 1,
                client_response: "pending",
                request_status: "quoted",
                quoted_price: 100,
                scheduled_datetime: "2026-10-01",
              },
            ],
          ]
        : [{ affectedRows: 1 }];
    },
    commit: async () => calls.push("commit"),
    rollback: async () => calls.push("rollback"),
    release: () => calls.push("release"),
  });
  assert.equal(
    (
      await request(
        "/api/quotes/1/respond",
        { response: "accepted" },
        false,
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    calls.filter((sql) => sql.includes("INSERT INTO Orders")).length,
    1,
  );
  assert.deepEqual(calls.slice(-2), ["commit", "release"]);
});

test("paid bills cannot be revised", async () => {
  acquire = async () => ({
    beginTransaction: async () => {},
    query: async () => [[{ bill_status: "paid" }]],
    rollback: async () => {},
    release: () => {},
  });
  assert.equal(
    (
      await request(
        "/api/bills/1/revise",
        { revised_amount: 100, revision_note: "Correction" },
        true,
        "PATCH",
      )
    ).status,
    409,
  );
});

test("missing orders return 404 when updating status", async () => {
  query = async () => [{ affectedRows: 0 }];
  assert.equal(
    (
      await request(
        "/api/orders/999/status",
        { completion_status: "completed" },
        true,
        "PATCH",
      )
    ).status,
    404,
  );
});

test("new quotes accept valid input and commit their transaction", async () => {
  const calls = [];
  acquire = async () => ({
    beginTransaction: async () => calls.push("begin"),
    query: async (sql) => {
      calls.push(sql);
      return sql.startsWith("SELECT")
        ? [[{ status: "pending" }]]
        : [{ insertId: 10 }];
    },
    commit: async () => calls.push("commit"),
    rollback: async () => calls.push("rollback"),
    release: () => calls.push("release"),
  });
  const response = await request(
    "/api/quotes",
    {
      request_id: 1,
      quoted_price: 100,
      scheduled_datetime: "2026-10-01T10:00",
    },
    true,
  );
  assert.equal(response.status, 201);
  assert.deepEqual(calls.slice(-2), ["commit", "release"]);
});

test("invalid report filters return 400", async () => {
  assert.equal(
    (
      await fetch(base + "/api/dashboard/accepted-quotes?month=13&year=2026", {
        headers: headers(true),
      })
    ).status,
    400,
  );
});

test("health reflects database availability", async () => {
  assert.equal((await fetch(base + "/api/health")).status, 200);
  query = async () => {
    throw new Error("offline");
  };
  assert.equal((await fetch(base + "/api/health")).status, 503);
});

test("invalid JSON and unknown API paths return JSON errors", async () => {
  const invalid = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{invalid",
  });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error, "Invalid JSON body.");
  const missing = await fetch(base + "/api/missing");
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error, "Endpoint not found");
});

test("unsupported uploads return 400 without leaving a file behind", async () => {
  const form = new FormData();
  form.append(
    "photos",
    new Blob(["<svg />"], { type: "image/svg+xml" }),
    "image.svg",
  );
  const response = await fetch(base + "/api/requests", {
    method: "POST",
    headers: { Authorization: "Bearer " + token() },
    body: form,
  });
  assert.equal(response.status, 400);
  assert.equal((await fs.readdir(uploadDir)).length, 0);
});

test("validation removes photos uploaded with invalid request fields", async () => {
  const form = new FormData();
  form.append(
    "photos",
    new Blob(["test image"], { type: "image/png" }),
    "image.png",
  );
  form.append("service_address", "");
  const response = await fetch(base + "/api/requests", {
    method: "POST",
    headers: { Authorization: "Bearer " + token() },
    body: form,
  });
  assert.equal(response.status, 400);
  assert.equal((await fs.readdir(uploadDir)).length, 0);
});
