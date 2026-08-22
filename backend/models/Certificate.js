const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
  },
  recipient: {
    name: { type: String, required: true },
    studentId: { type: String }, // Optional, based on typical structures
    email: { type: String }, // Needed for automated email notifications
    phone: { type: String } // Needed for SMS notifications
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
  },
  credential: {
    degree: { type: String, required: true },
    department: { type: String },
    classification: { type: String, required: true },
    graduationDate: { type: Date, required: true },
    expiresAt: { type: Date } // Expiry date if applicable
  },
  hash: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  keyVersion: {
    type: Number,
    default: 1,
  },
  qrData: {
    type: String, // Verification URL
    required: true,
  },
  revocation: {
    isRevoked: { type: Boolean, default: false },
    reason: { type: String },
    timestamp: { type: Date },
  },
  txHash: {
    type: String,
    // The blockchain transaction hash
  },
  blockNumber: {
    type: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
