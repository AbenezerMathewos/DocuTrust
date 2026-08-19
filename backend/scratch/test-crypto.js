const crypto = require('crypto');
const {
  canonicalizeCertificate,
  hashCertificate,
  signData,
  verifySignature
} = require('../utils/cryptoUtils');

console.log('--- Testing Crypto Utils ---');

// 1. Generate a test Ed25519 keypair
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// 2. Mock Certificate Data
const certData = {
  certificateId: 'CERT-HU-2026-CS-0104',
  recipientName: 'Abenezer Mathewos',
  degree: 'Bachelor of Science in Computer Science',
  institution: 'Hawassa University',
  graduationDate: '2026-07-15'
};

// 3. Canonicalize
const canonicalStr = canonicalizeCertificate(certData);
console.log('\nCanonical String:');
console.log(canonicalStr);

// 4. Hash
const hashHex = hashCertificate(canonicalStr);
console.log('\nSHA-256 Hash:');
console.log(hashHex);

// 5. Sign
const signature = signData(canonicalStr, privateKey);
console.log('\nEd25519 Signature (Base64):');
console.log(signature);

// 6. Verify
const isValid = verifySignature(canonicalStr, signature, publicKey);
console.log(`\nSignature is valid: ${isValid}`);

// 7. Test Tampering
const tamperedStr = canonicalizeCertificate({ ...certData, degree: 'Master of Science in Computer Science' });
const isTamperedValid = verifySignature(tamperedStr, signature, publicKey);
console.log(`Tampered signature is valid: ${isTamperedValid}`);
