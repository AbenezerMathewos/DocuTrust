const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const Institution = require('../models/Institution');
const User = require('../models/User');
const { canonicalizeCertificate, hashCertificate, signData } = require('../utils/cryptoUtils');
const { generateVerificationQR } = require('../utils/qrUtils');
const { generateCertificatePDF } = require('../utils/pdfUtils');
const { sendCertificateNotification } = require('../utils/emailUtils');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { anchorToBlockchain } = require('../utils/blockchainSimulation');

// @desc    Issue a single certificate
// @route   POST /api/certificates/issue
// @access  Private
const issueCertificate = async (req, res) => {
  try {
    const { recipientName, recipientEmail, studentId, institutionCode, degree, department, classification, graduationDate, expiresAt } = req.body;

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
      graduationDate,
      ...(expiresAt && { expiresAt })
    };

    // 5. Canonicalize & Hash
    const canonicalStr = canonicalizeCertificate(certPayload);
    const hash = hashCertificate(canonicalStr);

    // 6. Sign
    const signature = signData(canonicalStr, privateKey);

    // 7. Generate QR
    const qrDataUri = await generateVerificationQR(certificateId);

    // Anchoring to Blockchain (Simulated)
    const txReceipt = anchorToBlockchain(hash, certificateId);

    // 8. Save to Database
    const certificate = await Certificate.create({
      certificateId,
      recipient: {
        name: recipientName,
        studentId,
        email: recipientEmail
      },
      issuer: institution._id,
      credential: {
        degree,
        department,
        classification,
        graduationDate,
        expiresAt
      },
      hash,
      signature,
      qrData: qrDataUri,
      txHash: txReceipt.txHash,
      blockNumber: txReceipt.blockNumber
    });

    // Log action
    await AuditLog.create({
      action: 'ISSUE_SINGLE',
      actor: req.user ? req.user.name : institution.name,
      target: certificateId,
      details: `Issued to ${recipientName} (${degree})`
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

    // 10. Send Email Notification to Holder (non-blocking)
    const holderUser = await User.findOne({ studentId: studentId });
    if (holderUser && holderUser.email) {
      sendCertificateNotification(
        holderUser.email,
        recipientName,
        degree,
        institution.name,
        certificateId
      ).catch(err => console.error('Email error:', err));
    }

    // 11. Return PDF to client
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

const csv = require('csv-parser');
const archiver = require('archiver');
const { Readable } = require('stream');

// @desc    Issue certificates in batch via CSV
// @route   POST /api/certificates/batch-issue
// @access  Public (for now)
const batchIssueCertificates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const { institutionCode } = req.body;
    if (!institutionCode) {
      return res.status(400).json({ message: 'institutionCode is required' });
    }

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

    // 3. Parse CSV
    const results = [];
    const stream = Readable.from(req.file.buffer.toString('utf8'));
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    if (results.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty or invalid' });
    }

    // 4. Setup Archiver for ZIP response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=batch_certificates_${institution.code}.zip`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // 5. Process each row
    const generatedCertificates = [];
    for (const row of results) {
      const { recipientName, studentId, degree, department, classification, graduationDate } = row;
      
      // Basic validation
      if (!recipientName || !degree || !graduationDate) continue;

      const year = new Date(graduationDate).getFullYear() || new Date().getFullYear();
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      const certificateId = `CERT-${institution.code}-${year}-${randomHex}`;

      const certPayload = {
        certificateId,
        recipientName,
        degree,
        institution: institution.name,
        graduationDate
      };

      const canonicalStr = canonicalizeCertificate(certPayload);
      const hash = hashCertificate(canonicalStr);
      const signature = signData(canonicalStr, privateKey);
      const qrDataUri = await generateVerificationQR(certificateId);

      // Anchoring to Blockchain (Simulated)
      const txReceipt = anchorToBlockchain(hash, certificateId);

      // Save DB
      await Certificate.create({
        certificateId,
        recipient: { name: recipientName, studentId },
        issuer: institution._id,
        credential: { degree, department, classification, graduationDate },
        hash,
        signature,
        qrData: qrDataUri,
        txHash: txReceipt.txHash,
        blockNumber: txReceipt.blockNumber
      });

      // Generate PDF
      const pdfDataForDocument = {
        certificateId,
        recipientName,
        degree,
        classification,
        graduationDate,
        institution: institution.name
      };
      
      const pdfBuffer = await generateCertificatePDF(pdfDataForDocument, qrDataUri);
      
      // Add to ZIP
      archive.append(pdfBuffer, { name: `${certificateId}_${recipientName.replace(/\s+/g, '_')}.pdf` });
      
      generatedCertificates.push(certificateId);
    }

    // Log action
    await AuditLog.create({
      action: 'ISSUE_BATCH',
      actor: 'Registrar',
      target: 'BATCH',
      details: `Issued ${generatedCertificates.length} certificates`
    });

    archive.finalize();

  } catch (error) {
    console.error('Error in batch issuance:', error);
    // Note: If headers are already sent by archiver, res.status will throw. 
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public (for now - should be protected)
const getAllCertificates = async (req, res) => {
  try {
    const { institutionCode } = req.query;
    
    let filter = {};
    if (institutionCode) {
      const institution = await Institution.findOne({ code: institutionCode.toUpperCase() });
      if (institution) {
        filter.issuer = institution._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    const certificates = await Certificate.find(filter)
      .populate('issuer', 'name code')
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke a certificate
// @route   PUT /api/certificates/revoke/:certificateId
// @access  Public (for now - should be protected)
const revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (certificate.revocation && certificate.revocation.isRevoked) {
      return res.status(400).json({ message: 'Certificate is already revoked' });
    }

    certificate.revocation = {
      isRevoked: true,
      revokedAt: new Date(),
      reason: reason || 'No reason provided'
    };

    await certificate.save();

    // Log action
    await AuditLog.create({
      action: 'REVOKE',
      actor: 'Registrar',
      target: certificateId,
      details: `Reason: ${reason || 'No reason provided'}`
    });

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's certificates (Self Service Portal)
// @route   GET /api/certificates/my-documents
// @access  Private (Holder)
const getMyDocuments = async (req, res) => {
  try {
    // If student doesn't have a studentId set in their profile, they can't fetch certificates yet
    if (!req.user.studentId && !req.user.email) {
      return res.status(400).json({ success: false, message: 'Please update your profile with your Student ID to fetch certificates.' });
    }
    
    // Find certs matching either the student ID or email as a fallback if you implement email in certs
    // Here we rely on studentId
    const filter = { 'recipient.studentId': req.user.studentId };
    
    const certificates = await Certificate.find(filter)
      .populate('issuer', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching student certificates:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download a certificate PDF by ID
// @route   GET /api/certificates/download/:certificateId
// @access  Private (holder or issuer)
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId }).populate('issuer', 'name code');
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    const pdfData = {
      certificateId: cert.certificateId,
      recipientName: cert.recipient.name,
      degree: cert.credential.degree,
      classification: cert.credential.classification,
      graduationDate: cert.credential.graduationDate,
      institution: cert.issuer.name
    };

    const pdfBuffer = await generateCertificatePDF(pdfData, cert.qrData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${certificateId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's profile
// @route   GET /api/auth/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/auth/me
// @access  Private
const updateMyProfile = async (req, res) => {
  try {
    const { name, studentId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (studentId) user.studentId = studentId;
    await user.save();
    res.status(200).json({ success: true, data: { name: user.name, email: user.email, role: user.role, studentId: user.studentId } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  issueCertificate,
  verifyCertificate,
  batchIssueCertificates,
  getAllCertificates,
  revokeCertificate,
  getMyDocuments,
  downloadCertificate,
  getMyProfile,
  updateMyProfile
};
