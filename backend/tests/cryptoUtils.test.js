const { generateKeyPairSync } = require('crypto');
const {
  canonicalizeCertificate,
  hashCertificate,
  signData,
  verifyData
} = require('../utils/cryptoUtils');

describe('Cryptographic Utilities', () => {
  let publicKeyBase64, privateKeyBase64;

  beforeAll(() => {
    // Generate Ed25519 test keys
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    publicKeyBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
    privateKeyBase64 = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
  });

  describe('canonicalizeCertificate', () => {
    it('should correctly format and sort a JSON object', () => {
      const obj1 = { b: 2, a: 1, c: { e: 5, d: 4 } };
      const obj2 = { a: 1, c: { d: 4, e: 5 }, b: 2 };

      const json1 = canonicalizeCertificate(obj1);
      const json2 = canonicalizeCertificate(obj2);

      expect(json1).toEqual('{"a":1,"b":2,"c":{"d":4,"e":5}}');
      expect(json1).toEqual(json2);
    });
  });

  describe('hashCertificate', () => {
    it('should generate a consistent SHA-256 hash', () => {
      const canonicalJson = '{"a":1,"b":2}';
      const hash1 = hashCertificate(canonicalJson);
      const hash2 = hashCertificate(canonicalJson);

      expect(hash1).toHaveLength(64); // hex string length of SHA-256
      expect(hash1).toEqual(hash2);
      
      const modifiedHash = hashCertificate('{"a":1,"b":3}');
      expect(hash1).not.toEqual(modifiedHash);
    });
  });

  describe('signData and verifyData', () => {
    const data = "super_secret_payload";

    it('should sign data and verify successfully with the correct keys', () => {
      const signature = signData(data, privateKeyBase64);
      const isValid = verifyData(data, signature, publicKeyBase64);
      
      expect(isValid).toBe(true);
    });

    it('should fail verification if the data is tampered with', () => {
      const signature = signData(data, privateKeyBase64);
      const isValid = verifyData(data + "tampered", signature, publicKeyBase64);
      
      expect(isValid).toBe(false);
    });

    it('should fail verification if the signature is invalid', () => {
      const invalidSignature = Buffer.from("fake_signature_that_is_not_real").toString('base64');
      
      let isValid;
      try {
        isValid = verifyData(data, invalidSignature, publicKeyBase64);
      } catch (e) {
        isValid = false; // Crypto library might throw on bad format
      }

      expect(isValid).toBe(false);
    });
  });
});
