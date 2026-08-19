const express = require('express');
const router = express.Router();
const { issueCertificate } = require('../controllers/certificateController');

router.post('/issue', issueCertificate);

module.exports = router;
