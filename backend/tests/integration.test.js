// route integration tests using express in-memory dispatch
const assert = require('assert');
const { EventEmitter } = require('events');
const app = require('../server');
const { pool } = require('../config/db');

function simulateRequest({ method, url, body = null, headers = {} }) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = { ...headers };
    if (body) {
      req.headers['content-type'] = 'application/json';
      req.body = body;
    } else {
      req.body = {};
    }

    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    let responseBody = '';

    res.status = function (code) {
      res.statusCode = code;
      return res;
    };

    res.setHeader = function (name, value) {
      res._headers[name.toLowerCase()] = value;
    };

    res.getHeader = function (name) {
      return res._headers[name.toLowerCase()];
    };

    res.json = function (data) {
      responseBody = data;
      resolve({ statusCode: res.statusCode, body: responseBody });
    };

    res.send = function (data) {
      responseBody = data;
      resolve({ statusCode: res.statusCode, body: responseBody });
    };

    res.end = function (data) {
      if (data) responseBody = data;
      resolve({ statusCode: res.statusCode, body: responseBody });
    };

    app.handle(req, res);
  });
}

// option to test specific groups: --group=health, auth, rbac, or all
const args = process.argv.slice(2);
const groupArg = args.find((a) => a.startsWith('--group='));
const targetGroup = groupArg ? groupArg.split('=')[1].toLowerCase() : 'all';

async function runGroupHealth() {
  console.log('Testing health check & 404 handler...');

  const healthRes = await simulateRequest({ method: 'GET', url: '/api/health' });
  assert.strictEqual(healthRes.statusCode, 200);
  assert.strictEqual(healthRes.body.status, 'ONLINE');
  console.log('  PASS: GET /api/health returns 200 ONLINE');

  const usersRes = await simulateRequest({ method: 'GET', url: '/api/users' });
  assert.ok(usersRes.statusCode === 200 || usersRes.statusCode === 500);
  if (usersRes.statusCode === 200) {
    assert.ok(Array.isArray(usersRes.body));
  } else {
    assert.strictEqual(usersRes.body.error, 'Could not load users');
  }
  console.log('  PASS: GET /api/users responds properly');

  const notFoundRes = await simulateRequest({ method: 'GET', url: '/api/unknown-system-route' });
  assert.strictEqual(notFoundRes.statusCode, 404);
  console.log('  PASS: undefined route returns 404');
}

async function runGroupAuth() {
  console.log('\nTesting auth routes...');

  const regRes = await simulateRequest({
    method: 'POST',
    url: '/api/auth/register',
    body: { name: 'A' },
  });
  assert.strictEqual(regRes.statusCode, 400);
  assert.strictEqual(regRes.body.success, false);
  console.log('  PASS: POST /api/auth/register validates payload');

  const loginRes = await simulateRequest({
    method: 'POST',
    url: '/api/auth/login',
    body: { email: 'bad' },
  });
  assert.strictEqual(loginRes.statusCode, 400);
  console.log('  PASS: POST /api/auth/login rejects invalid input');
}

async function runGroupRBAC() {
  console.log('\nTesting role authorization protection...');

  const apptRes = await simulateRequest({
    method: 'GET',
    url: '/api/appointments/patient/my-appointments',
  });
  assert.strictEqual(apptRes.statusCode, 401);
  console.log('  PASS: GET /api/appointments requires auth token');

  const adminRes = await simulateRequest({
    method: 'GET',
    url: '/api/admin/stats',
  });
  assert.strictEqual(adminRes.statusCode, 401);
  console.log('  PASS: GET /api/admin/stats blocked without token');

  const queueRes = await simulateRequest({
    method: 'GET',
    url: '/api/queue/patient/live',
  });
  assert.strictEqual(queueRes.statusCode, 401);
  console.log('  PASS: GET /api/queue/patient/live protected');
}

async function runGroupContact() {
  console.log('\nTesting contact routes...');

  const invalidRes = await simulateRequest({
    method: 'POST',
    url: '/api/contact',
    body: { name: 'Test' },
  });
  assert.strictEqual(invalidRes.statusCode, 400);
  assert.strictEqual(invalidRes.body.success, false);
  console.log('  PASS: POST /api/contact validates payload');

  const validRes = await simulateRequest({
    method: 'POST',
    url: '/api/contact',
    body: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 98765 43210',
      department: 'General Inquiry',
      message: 'Inquiring about Saturday OPD clinic timing.',
    },
  });
  assert.strictEqual(validRes.statusCode, 201);
  assert.strictEqual(validRes.body.success, true);
  assert.ok(validRes.body.ticket && validRes.body.ticket.ticketId.startsWith('MQ-TKT-'));
  console.log('  PASS: POST /api/contact issues ticket reference');
}

async function run() {
  console.log(`\nRunning integration tests (${targetGroup})...\n`);

  if (targetGroup === 'health' || targetGroup === 'all') {
    await runGroupHealth();
  }

  if (targetGroup === 'auth' || targetGroup === 'all') {
    await runGroupAuth();
  }

  if (targetGroup === 'rbac' || targetGroup === 'all') {
    await runGroupRBAC();
  }

  if (targetGroup === 'contact' || targetGroup === 'all') {
    await runGroupContact();
  }

  console.log('\nIntegration tests completed successfully!\n');

  try {
    await pool.end();
  } catch (_) {}

  process.exit(0);
}

run().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
