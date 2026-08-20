// Full end-to-end test of all actors in the DocuTrust system
// Registers fresh users each run so no password guessing needed
const axios = require('axios');

const BASE = 'http://localhost:5000/api';
const TS = Date.now();
const ADMIN_EMAIL = `testadmin_${TS}@docutrust.test`;
const USER_EMAIL = `testuser_${TS}@docutrust.test`;
const PASSWORD = 'TestPass123!';

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
    res.status === 200 ? PASS(`API is healthy`) : FAIL(`Status was ${res.status}`);
  } catch (e) { FAIL(`Health: ${e.message}`); }

  // ─── 2. Register Admin (role=admin) ─────────────────────────
  console.log('\n─── 2. Register Admin User');
  try {
    const res = await axios.post(`${BASE}/auth/register`, { name: 'Test Admin', email: ADMIN_EMAIL, password: PASSWORD, role: 'admin' });
    adminToken = res.data.token;
    adminToken ? PASS(`Admin registered. Email: ${ADMIN_EMAIL}`) : FAIL(`No token`);
  } catch (e) { FAIL(`Register admin: ${e.response?.data?.error || e.message}`); }

  // ─── 3. Register Regular User ───────────────────────────────
  console.log('\n─── 3. Register Regular User');
  try {
    const res = await axios.post(`${BASE}/auth/register`, { name: 'Test User', email: USER_EMAIL, password: PASSWORD, role: 'user' });
    userToken = res.data.token;
    userToken ? PASS(`User registered. Email: ${USER_EMAIL}`) : FAIL(`No token`);
  } catch (e) { FAIL(`Register user: ${e.response?.data?.error || e.message}`); }

  // ─── 4. Login as Admin ──────────────────────────────────────
  console.log('\n─── 4. Login as Admin');
  try {
    const res = await axios.post(`${BASE}/auth/login`, { email: ADMIN_EMAIL, password: PASSWORD });
    adminToken = res.data.token;
    adminToken ? PASS(`Admin logged in`) : FAIL(`No token`);
  } catch (e) { FAIL(`Admin login: ${e.response?.data?.error || e.message}`); }

  // ─── 5. Login as Regular User ───────────────────────────────
  console.log('\n─── 5. Login as Regular User');
  try {
    const res = await axios.post(`${BASE}/auth/login`, { email: USER_EMAIL, password: PASSWORD });
    userToken = res.data.token;
    userToken ? PASS(`User logged in`) : FAIL(`No token`);
  } catch (e) { FAIL(`User login: ${e.response?.data?.error || e.message}`); }

  // ─── 6. Protected Route — No Token (expect 401) ─────────────
  console.log('\n─── 6. Protected Route — No Token (expect 401)');
  try {
    await axios.get(`${BASE}/certificates`);
    FAIL('Should have been rejected but got 200');
  } catch (e) {
    e.response?.status === 401 ? PASS(`Correctly rejected with 401`) : FAIL(`Got unexpected status ${e.response?.status}`);
  }

  // ─── 7. Admin Issues a Certificate ──────────────────────────
  console.log('\n─── 7. Admin — Issue Certificate');
  if (adminToken) {
    try {
      const res = await axios.post(`${BASE}/certificates/issue`, {
        recipientName: 'Alice Wonderland',
        studentId: 'STU-TEST-001',
        institutionCode: 'HU',
        degree: 'Bachelor of Science',
        department: 'Computer Science',
        classification: 'First Class',
        graduationDate: '2026-06-01',
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      // POST /issue returns PDF, so we don't get JSON back!
      // But we can check response headers or status.
      res.status === 201 ? PASS(`Issued: PDF received`) : FAIL(`No PDF`);
      
      // Let's get the certificateId from the database directly or from headers?
      // Content-Disposition: attachment; filename=CERT-INSA-2026-XXXX.pdf
      const contentDisp = res.headers['content-disposition'];
      if (contentDisp) {
        const match = contentDisp.match(/filename=([^.]+)\.pdf/);
        if (match) issuedCertificateId = match[1];
      }
    } catch (e) { FAIL(`Issue: ${e.response?.data?.error || e.message}`); }
  } else { FAIL('Skipped — no admin token'); }

  // ─── 8. Regular User Issues a Certificate ───────────────────
  console.log('\n─── 8. Regular User — Issue Certificate');
  if (userToken) {
    try {
      const res = await axios.post(`${BASE}/certificates/issue`, {
        recipientName: 'Bob Builder',
        studentId: 'STU-TEST-002',
        institutionCode: 'HU',
        degree: 'Master of Arts',
        department: 'Art History',
        classification: 'Distinction',
        graduationDate: '2026-07-01',
      }, { headers: { Authorization: `Bearer ${userToken}` } });
      res.status === 201 ? PASS(`Regular user can also issue`) : FAIL(`No PDF`);
    } catch (e) { FAIL(`User issue: ${e.response?.data?.error || e.message}`); }
  } else { FAIL('Skipped — no user token'); }

  // ─── 9. Public — Verify Certificate ─────────────────────────
  console.log('\n─── 9. Public — Verify Certificate (no auth needed)');
  if (issuedCertificateId) {
    try {
      const res = await axios.get(`${BASE}/certificates/verify/${issuedCertificateId}`);
      res.data.status === 'AUTHENTIC' ? PASS(`Signature is AUTHENTIC ✨`) : FAIL(`Unexpected status: ${res.data.status}`);
    } catch (e) { FAIL(`Verify: ${e.response?.data?.error || e.message}`); }
  } else { FAIL('Skipped — no certificate'); }

  // ─── 10. Regular User Gets All Certificates ─────────────────
  console.log('\n─── 10. Regular User — Get All Certificates');
  if (userToken) {
    try {
      const res = await axios.get(`${BASE}/certificates`, { headers: { Authorization: `Bearer ${userToken}` } });
      Array.isArray(res.data.data) ? PASS(`Got ${res.data.data.length} certificate(s)`) : FAIL('Response is not an array');
    } catch (e) { FAIL(`Get certs as user: ${e.response?.data?.message || e.message}`); }
  } else { FAIL('Skipped — no user token'); }

  // ─── 11. Admin Gets Audit Logs ──────────────────────────────
  console.log('\n─── 11. Admin — Get Audit Logs');
  if (adminToken) {
    try {
      const res = await axios.get(`${BASE}/audit`, { headers: { Authorization: `Bearer ${adminToken}` } });
      Array.isArray(res.data.data) ? PASS(`Got ${res.data.data.length} audit log(s)`) : FAIL('Response is not an array');
    } catch (e) { FAIL(`Audit: ${e.response?.data?.message || e.message}`); }
  } else { FAIL('Skipped — no admin token'); }

  // ─── 12. Admin Revokes Certificate ──────────────────────────
  console.log('\n─── 12. Admin — Revoke Certificate');
  if (adminToken && issuedCertificateId) {
    try {
      const res = await axios.put(`${BASE}/certificates/revoke/${issuedCertificateId}`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
      res.data.data?.revocation?.isRevoked ? PASS(`Certificate revoked`) : FAIL(`isRevoked not true`);
    } catch (e) { FAIL(`Revoke: ${e.response?.data?.error || e.message}`); }
  } else { FAIL('Skipped'); }

  // ─── 13. Verify Revoked Certificate ─────────────────────────
  console.log('\n─── 13. Public — Verify Revoked Certificate (expect REVOKED)');
  if (issuedCertificateId) {
    try {
      const res = await axios.get(`${BASE}/certificates/verify/${issuedCertificateId}`);
      res.data.status === 'REVOKED' ? PASS(`Correctly shows REVOKED`) : FAIL(`Unexpected: ${res.data.status}`);
    } catch (e) { FAIL(`Verify revoked: ${e.message}`); }
  } else { FAIL('Skipped'); }

  // ─── 14. Verify Non-Existent Certificate ────────────────────
  console.log('\n─── 14. Public — Verify Non-Existent Certificate (expect NOT_FOUND)');
  try {
    await axios.get(`${BASE}/certificates/verify/FAKE-ID-000`);
    FAIL(`Should have returned 404`);
  } catch (e) {
    if (e.response?.status === 404 && e.response?.data?.status === 'NOT_FOUND') {
      PASS(`Correctly shows NOT_FOUND`);
    } else {
      FAIL(`Unexpected: ${e.message}`);
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log('  Test Suite Complete');
  console.log('════════════════════════════════════════════\n');
  process.exit(0);
}

runTests().catch(e => { console.error('Unhandled:', e.message); process.exit(1); });
