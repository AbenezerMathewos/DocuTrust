const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('root_admin', 'issuer'), getAuditLogs);

module.exports = router;
