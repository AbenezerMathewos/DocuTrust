const express = require('express');
const multer = require('multer');
const router = express.Router();
const { issueCertificate, verifyCertificate, batchIssueCertificates, getAllCertificates, revokeCertificate } = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer config for in-memory processing
const upload = multer({ storage: multer.memoryStorage() });

router.post('/issue', protect, authorize('root_admin', 'issuer'), issueCertificate);
router.post('/batch-issue', protect, authorize('root_admin', 'issuer'), upload.single('file'), batchIssueCertificates);
router.get('/verify/:certificateId', verifyCertificate); // Public
router.get('/', protect, authorize('root_admin', 'issuer'), getAllCertificates);
router.put('/revoke/:certificateId', protect, authorize('root_admin', 'issuer'), revokeCertificate);
// Add the Holder (student) route
const { getMyDocuments } = require('../controllers/certificateController');
router.get('/my-documents', protect, authorize('holder'), getMyDocuments);

module.exports = router;
