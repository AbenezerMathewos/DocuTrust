const Certificate = require('../models/Certificate');
const Institution = require('../models/Institution');
const { canonicalizeCertificate, hashCertificate, signData } = require('../utils/cryptoUtils');
const { generateVerificationQR } = require('../utils/qrUtils');
const { generateCertificatePDF } = require('../utils/pdfUtils');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// @desc    Issue a single certificate
// @route   POST /api/certificates/issue
// @access  Public (for now)
const issueCertificate = async (req, res) => {
  try {
    const { recipientName, studentId, institutionCode, degree, department, classification, graduationDate } = req.body;

    // 1. Load Institution
    const institution = await Institution.findOne({ code: institutionCode.toUpperCase() });
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }
    if (!institution.isActive) {
      return res.status(400).json({ message: 'Institution is inactive' });
    }

    // 2. Load Private Key
    const privateKeyPath = path.join(__dirname, '..', 'keys', `${institution.code}_private.pem`);
    if (!fs.existsSync(privateKeyPath)) {
      return res.status(500).json({ message: 'Institution private key not found on server' });
    }
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    // 3. Generate Certificate ID (CERT-<code>-<year>-<randomHex>)
    const year = new Date(graduationDate).getFullYear() || new Date().getFullYear();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const certificateId = `CERT-${institution.code}-${year}-${randomHex}`;

    // 4. Build canonical data payload
    const certPayload = {
      certificateId,
      recipientName,
      degree,
      institution: institution.name,
      graduationDate
    };

    // 5. Canonicalize & Hash
    const canonicalStr = canonicalizeCertificate(certPayload);
    const hash = hashCertificate(canonicalStr);

    // 6. Sign
    const signature = signData(canonicalStr, privateKey);

    // 7. Generate QR
    const qrDataUri = await generateVerificationQR(certificateId);

    // 8. Save to Database
    const certificate = await Certificate.create({
      certificateId,
      recipient: {
        name: recipientName,
        studentId
      },
      issuer: institution._id,
      credential: {
        degree,
        department,
        classification,
        graduationDate
      },
      hash,
      signature,
      qrData: qrDataUri // For simplicity we can store the Data URI or just the verification URL. Storing the Data URI here.
    });

    // 9. Generate PDF
    const pdfDataForDocument = {
      certificateId,
      recipientName,
      degree,
      classification,
      graduationDate,
      institution: institution.name
    };
    const pdfBuffer = await generateCertificatePDF(pdfDataForDocument, qrDataUri);

    // 10. Return PDF to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${certificateId}.pdf`);
    res.status(201).send(pdfBuffer);

  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify a certificate
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // 1. Fetch certificate from DB and populate issuer details
    const cert = await Certificate.findOne({ certificateId }).populate('issuer');

    if (!cert) {
      return res.status(404).json({ status: 'NOT_FOUND', message: 'Certificate not found in the database.' });
    }

    if (cert.revocation && cert.revocation.isRevoked) {
      return res.status(200).json({ status: 'REVOKED', message: 'This certificate has been revoked by the issuer.' });
    }

    if (!cert.issuer.isActive) {
      return res.status(200).json({ status: 'ISSUER_INACTIVE', message: 'The issuing institution is currently inactive.' });
    }

    // 2. Reconstruct the original payload
    // Important: format date exactly as it was provided during issuance (YYYY-MM-DD)
    const formattedDate = cert.credential.graduationDate.toISOString().substring(0, 10);
    
    const certPayload = {
      certificateId: cert.certificateId,
      recipientName: cert.recipient.name,
      degree: cert.credential.degree,
      institution: cert.issuer.name,
      graduationDate: formattedDate
    };

    // 3. Verify the mathematical signature
    const canonicalStr = canonicalizeCertificate(certPayload);
    // Dynamic import to use verifySignature (ensure it's in cryptoUtils import at top)
    const { verifySignature } = require('../utils/cryptoUtils');
    
    const isValid = verifySignature(canonicalStr, cert.signature, cert.issuer.publicKey);

    if (isValid) {
      return res.status(200).json({ 
        status: 'AUTHENTIC', 
        message: 'Certificate is authentic and mathematically verified.',
        data: certPayload
      });
    } else {
      return res.status(200).json({ 
        status: 'TAMPERED', 
        message: 'Certificate signature is invalid. Data may have been tampered with.' 
      });
    }

  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  issueCertificate,
  verifyCertificate
};
