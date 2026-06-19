const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  originalUrl: { type: String, required: true },
  signedUrl: { type: String },
  status: { type: String, enum: ['pending', 'signed'], default: 'pending' },
 verificationId: { type: String, unique: true, sparse: true },
  documentHash: { type: String },
  signedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);