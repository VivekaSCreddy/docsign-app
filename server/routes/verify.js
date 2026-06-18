const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

router.get('/:verificationId', async (req, res) => {
  try {
    const doc = await Document.findOne({
      verificationId: req.params.verificationId
    }).populate('userId', 'name email');

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    await AuditLog.create({
      action: 'VERIFY',
      documentId: doc._id,
      ipAddress: req.ip,
      metadata: { verificationId: req.params.verificationId }
    });

    res.json({
      valid: true,
      documentName: doc.originalName,
      signedBy: doc.userId.name,
      signerEmail: doc.userId.email,
      signedAt: doc.signedAt,
      documentHash: doc.documentHash,
      status: doc.status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;