const express = require('express');
const multer = require('multer');
const router = express.Router();
const { issueCertificate, verifyCertificate, batchIssueCertificates, getAllCertificates, revokeCertificate } = require('../controllers/certificateController');

// Multer config for in-memory processing
const upload = multer({ storage: multer.memoryStorage() });

router.post('/issue', issueCertificate);
router.post('/batch-issue', upload.single('file'), batchIssueCertificates);
router.get('/verify/:certificateId', verifyCertificate);
router.get('/', getAllCertificates);
router.put('/revoke/:certificateId', revokeCertificate);

module.exports = router;
