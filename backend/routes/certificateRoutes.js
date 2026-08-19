const express = require('express');
const router = express.Router();
const { issueCertificate, verifyCertificate } = require('../controllers/certificateController');

router.post('/issue', issueCertificate);
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
