const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['ISSUE_SINGLE', 'ISSUE_BATCH', 'REVOKE', 'SYSTEM_INIT', 'VERIFY', 'LOGIN', 'INSTITUTION_TOGGLE', 'DOWNLOAD']
  },
  actor: {
    type: String,
    required: true,
    default: 'System'
  },
  target: {
    type: String, // E.g., Certificate ID or "BATCH"
    required: true
  },
  details: {
    type: String,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
