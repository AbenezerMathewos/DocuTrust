const AuditLog = require('../models/AuditLog');
const Certificate = require('../models/Certificate');
const Institution = require('../models/Institution');
const User = require('../models/User');
const { getLedger } = require('../utils/blockchainSimulation');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (root_admin, issuer)
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform-wide stats for Admin Dashboard
// @route   GET /api/audit/stats
// @access  Private (root_admin only)
const getAdminStats = async (req, res) => {
  try {
    const totalCertificates = await Certificate.countDocuments();
    const revokedCertificates = await Certificate.countDocuments({ 'revocation.isRevoked': true });
    const totalInstitutions = await Institution.countDocuments();
    const activeInstitutions = await Institution.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalCertificates,
        revokedCertificates,
        validCertificates: totalCertificates - revokedCertificates,
        totalInstitutions,
        activeInstitutions,
        totalUsers,
        recentLogs
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the local simulated blockchain ledger
// @route   GET /api/audit/blockchain
// @access  Private (root_admin only)
const getBlockchainLedger = async (req, res) => {
  try {
    const ledger = getLedger();
    res.status(200).json({ success: true, count: ledger.length, data: ledger });
  } catch (error) {
    console.error('Error fetching blockchain ledger:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAuditLogs,
  getAdminStats,
  getBlockchainLedger
};
