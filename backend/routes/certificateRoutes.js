const express = require('express');
const multer = require('multer');
const router = express.Router();
const { issueCertificate, verifyCertificate, batchIssueCertificates, getAllCertificates, revokeCertificate } = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer config for in-memory processing
const upload = multer({ storage: multer.memoryStorage() });

router.post('/issue', protect, authorize('admin', 'user'), issueCertificate);
router.post('/batch-issue', protect, authorize('admin', 'user'), upload.single('file'), batchIssueCertificates);
router.get('/verify/:certificateId', verifyCertificate); // Public
router.get('/', protect, authorize('admin', 'user'), getAllCertificates);
router.put('/revoke/:certificateId', protect, authorize('admin', 'user'), revokeCertificate);

module.exports = router;
