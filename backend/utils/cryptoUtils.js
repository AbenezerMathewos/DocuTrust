const crypto = require('crypto');

/**
 * Deterministically stringifies an object by sorting its keys.
 * This ensures that identical data always produces the same JSON string,
 * regardless of the order properties were added.
 */
const canonicalizeCertificate = (certData) => {
  // A simple recursive function to sort object keys
  const sortKeys = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(sortKeys);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    for (const key of sortedKeys) {
      result[key] = sortKeys(obj[key]);
    }
    return result;
  };

  const sortedData = sortKeys(certData);
  return JSON.stringify(sortedData);
};

/**
 * Creates a SHA-256 hash of a string (usually the canonical string).
 * Returns a hex string.
 */
const hashCertificate = (canonicalString) => {
  return crypto.createHash('sha256').update(canonicalString).digest('hex');
};

/**
 * Signs data (the canonical string) using an Ed25519 private key.
 * Returns the signature as a base64 string.
 */
const signData = (dataString, privateKeyPem) => {
  // In Node.js, to sign with Ed25519, we pass the raw data (it hashes internally)
  // Or we can sign the hash. Standard Ed25519 signs the raw data.
  // The documentation in step 7 says: Canonical JSON -> SHA-256 -> Ed25519 -> Digital Signature.
  // However, Ed25519 usually operates on the raw message. 
  // We will hash it first as requested by the documentation flow.
  
  const hashHex = hashCertificate(dataString);
  const hashBuffer = Buffer.from(hashHex, 'utf8');

  // Node's crypto.sign(null, data, key) is used for Ed25519
  const signature = crypto.sign(null, hashBuffer, privateKeyPem);
  return signature.toString('base64');
};

/**
 * Verifies a signature.
 */
const verifySignature = (dataString, signatureBase64, publicKeyPem) => {
  const hashHex = hashCertificate(dataString);
  const hashBuffer = Buffer.from(hashHex, 'utf8');
  const signatureBuffer = Buffer.from(signatureBase64, 'base64');
  
  return crypto.verify(null, hashBuffer, publicKeyPem, signatureBuffer);
};

module.exports = {
  canonicalizeCertificate,
  hashCertificate,
  signData,
  verifySignature
};
