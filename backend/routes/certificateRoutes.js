const express = require('express');
const multer = require('multer');
const router = express.Router();
const { issueCertificate, verifyCertificate, batchIssueCertificates } = require('../controllers/certificateController');

// Multer config for in-memory processing
const upload = multer({ storage: multer.memoryStorage() });

router.post('/issue', issueCertificate);
router.post('/batch-issue', upload.single('file'), batchIssueCertificates);
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
