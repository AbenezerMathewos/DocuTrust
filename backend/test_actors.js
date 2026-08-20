// Full end-to-end test of all actors in the DocuTrust system
const axios = require('axios');

const BASE = 'http://localhost:5000/api';

const PASS = (msg) => console.log(`  ✅ PASS: ${msg}`);
const FAIL = (msg) => console.log(`  ❌ FAIL: ${msg}`);

async function runTests() {
  console.log('\n════════════════════════════════════════════');
  console.log('  DocuTrust Full Actor Test Suite');
  console.log('════════════════════════════════════════════\n');

  let adminToken = '';
  let userToken = '';
  let issuedCertificateId = '';

  // ─── 1. Health Check ────────────────────────────────────────
  console.log('─── 1. Health Check');
  try {
    const res = await axios.get(`${BASE}/health`);
    res.status === 200 ? PASS(`API is healthy: ${res.data.message}`) : FAIL(`Status was ${res.status}`);
  } catch (e) { FAIL(`Health check: ${e.message}`); }

  // ─── 2. Admin Login ─────────────────────────────────────────
  console.log('\n─── 2. Admin Login (abeni@gmail.com)');
  try {
    const res = await axios.post(`${BASE}/auth/login`, { email: 'abeni@gmail.com', password: '123456' });
    adminToken = res.data.token;
    adminToken ? PASS(`Logged in. Token received.`) : FAIL(`No token in response`);
  } catch (e) { FAIL(`Admin login: ${e.response?.data?.error || e.message}`); }

  // ─── 3. User Login ──────────────────────────────────────────
  console.log('\n─── 3. Regular User Login (asme@gmail.com)');
  try {
    const res = await axios.post(`${BASE}/auth/login`, { email: 'asme@gmail.com', password: '123456' });
    userToken = res.data.token;
    userToken ? PASS(`Logged in. Token received.`) : FAIL(`No token in response`);
  } catch (e) { FAIL(`User login: ${e.response?.data?.error || e.message}`); }

  // ─── 4. Protected Route (no token) ──────────────────────────
  console.log('\n─── 4. Protected Route — No Token (expect 401)');
  try {
    await axios.get(`${BASE}/certificates`);
    FAIL('Should have been rejected but got 200');
  } catch (e) {
    e.response?.status === 401 ? PASS(`Correctly rejected with 401`) : FAIL(`Got unexpected status ${e.response?.status}`);
  }

  // ─── 5. Admin issues a certificate ──────────────────────────
  console.log('\n─── 5. Admin — Issue Certificate');
  if (adminToken) {
    try {
      const res = await axios.post(`${BASE}/certificates/issue`, {
        recipientName: 'Test Student',
        studentId: 'STU-TEST-001',
        degree: 'Bachelor of Science',
        department: 'Computer Science',
        classification: 'First Class Honors',
        graduationDate: '2026-06-01',
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      issuedCertificateId = res.data.certificate?.certificateId;
      issuedCertificateId ? PASS(`Certificate issued: ${issuedCertificateId}`) : FAIL(`No certificateId in response`);
    } catch (e) { FAIL(`Issue certificate: ${e.response?.data?.error || e.message}`); }
  } else { FAIL('Skipped — no admin token'); }

  // ─── 6. Public Verification ─────────────────────────────────
  console.log('\n─── 6. Public — Verify Certificate (no auth needed)');
  if (issuedCertificateId) {
    try {
      const res = await axios.get(`${BASE}/certificates/verify/${issuedCertificateId}`);
      res.data.status === 'AUTHENTIC' ? PASS(`Signature is AUTHENTIC`) : FAIL(`Unexpected status: ${res.data.status}`);
    } catch (e) { FAIL(`Verify certificate: ${e.response?.data?.error || e.message}`); }
  } else { FAIL('Skipped — no certificate to verify'); }

  // ─── 7. Regular User — Get All Certificates ─────────────────
  console.log('\n─── 7. Regular User — Get All Certificates');
  if (userToken) {
    try {
      const res = await axios.get(`${BASE}/certificates`, { headers: { Authorization: `Bearer ${userToken}` } });
      Array.isArray(res.data) ? PASS(`Got ${res.data.length} certificate(s)`) : FAIL('Response is not an array');
    } catch (e) { FAIL(`Get certificates as user: ${e.response?.data?.message || e.message}`); }
  } else { FAIL('Skipped — no user token'); }

  // ─── 8. Admin — Get Audit Logs ──────────────────────────────
  console.log('\n─── 8. Admin — Get Audit Logs');
  if (adminToken) {
    try {
      const res = await axios.get(`${BASE}/audit`, { headers: { Authorization: `Bearer ${adminToken}` } });
      Array.isArray(res.data) ? PASS(`Got ${res.data.length} audit log(s)`) : FAIL('Response is not an array');
    } catch (e) { FAIL(`Get audit logs: ${e.response?.data?.message || e.message}`); }
  } else { FAIL('Skipped — no admin token'); }

  // ─── 9. Admin — Revoke Certificate ──────────────────────────
  console.log('\n─── 9. Admin — Revoke Certificate');
  if (adminToken && issuedCertificateId) {
    try {
      const res = await axios.put(`${BASE}/certificates/revoke/${issuedCertificateId}`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
      res.data.certificate?.revocation?.isRevoked ? PASS('Certificate revoked successfully') : FAIL('isRevoked not true in response');
    } catch (e) { FAIL(`Revoke: ${e.response?.data?.error || e.message}`); }
  } else { FAIL('Skipped — missing token or certificate'); }

  // ─── 10. Verify Revoked Certificate ─────────────────────────
  console.log('\n─── 10. Public — Verify Revoked Certificate (expect REVOKED)');
  if (issuedCertificateId) {
    try {
      const res = await axios.get(`${BASE}/certificates/verify/${issuedCertificateId}`);
      res.data.status === 'REVOKED' ? PASS('Correctly shows REVOKED') : FAIL(`Unexpected status: ${res.data.status}`);
    } catch (e) { FAIL(`Verify revoked: ${e.response?.data?.error || e.message}`); }
  } else { FAIL('Skipped — no certificate'); }

  // ─── 11. New User Registration ──────────────────────────────
  console.log('\n─── 11. Register New User');
  const randomEmail = `testuser_${Date.now()}@docutrust.test`;
  try {
    const res = await axios.post(`${BASE}/auth/register`, { name: 'New Test User', email: randomEmail, password: 'password123' });
    res.data.token ? PASS(`Registered successfully. Email: ${randomEmail}`) : FAIL('No token in registration response');
  } catch (e) { FAIL(`Register: ${e.response?.data?.error || e.message}`); }

  // ─── 12. Not Found Certificate ──────────────────────────────
  console.log('\n─── 12. Public — Verify Non-Existent Certificate (expect NOT_FOUND)');
  try {
    const res = await axios.get(`${BASE}/certificates/verify/FAKE-ID-THAT-DOESNT-EXIST`);
    res.data.status === 'NOT_FOUND' ? PASS('Correctly shows NOT_FOUND') : FAIL(`Unexpected status: ${res.data.status}`);
  } catch (e) { FAIL(`Verify not found: ${e.response?.data?.error || e.message}`); }

  console.log('\n════════════════════════════════════════════');
  console.log('  Test Suite Complete');
  console.log('════════════════════════════════════════════\n');
  process.exit(0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
