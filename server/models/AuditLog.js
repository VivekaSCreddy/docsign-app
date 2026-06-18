const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: {
    type: String,
    enum: ['UPLOAD', 'SIGN', 'DOWNLOAD', 'VERIFY', 'LOGIN', 'REGISTER'],
    required: true
  },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  ipAddress: { type: String },
  metadata: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);