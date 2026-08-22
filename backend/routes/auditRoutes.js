const express = require('express');
const router = express.Router();
const { getAuditLogs, getAdminStats, getBlockchainLedger } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('root_admin', 'issuer'), getAuditLogs);
router.get('/stats', protect, authorize('root_admin'), getAdminStats);
router.get('/blockchain', protect, authorize('root_admin'), getBlockchainLedger);

module.exports = router;
