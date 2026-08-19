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
  },
  hash: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
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
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
