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

module.exports = {
  issueCertificate
};
