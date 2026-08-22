const express = require('express');
const multer = require('multer');
const router = express.Router();
const { issueCertificate, verifyCertificate, batchIssueCertificates, getAllCertificates, revokeCertificate, getMyDocuments, downloadCertificate, getMyProfile, updateMyProfile } = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer config for in-memory processing
const upload = multer({ storage: multer.memoryStorage() });

router.post('/issue', protect, authorize('root_admin', 'issuer'), issueCertificate);
router.post('/batch-issue', protect, authorize('root_admin', 'issuer'), upload.single('file'), batchIssueCertificates);
router.get('/verify/:certificateId', verifyCertificate); // Public
router.get('/', protect, authorize('root_admin', 'issuer'), getAllCertificates);
router.put('/revoke/:certificateId', protect, authorize('root_admin', 'issuer'), revokeCertificate);
// Holder routes
router.get('/my-documents', protect, authorize('holder'), getMyDocuments);
router.get('/download/:certificateId', protect, downloadCertificate);
// Profile routes
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
// Legacy Claim Route
router.post('/claim', protect, authorize('holder'), require('../controllers/certificateController').claimLegacyDocument);

module.exports = router;
