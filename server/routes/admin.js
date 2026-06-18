const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware, adminMiddleware);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/documents', async (req, res) => {
  try {
    const documents = await Document.find().populate('userId', 'name email');
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name email')
      .populate('documentId', 'originalName')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;