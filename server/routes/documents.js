const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { generateHash } = require('../utils/hash');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'docsign', public_id: filename },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

router.use(authMiddleware);

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const result = await uploadToCloudinary(
      req.file.buffer,
      `original_${Date.now()}`
    );

    const doc = await Document.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      originalUrl: result.secure_url,
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPLOAD',
      documentId: doc._id,
      ipAddress: req.ip,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/sign/:id', async (req, res) => {
  try {
    const { signatureDataUrl } = req.body;
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const response = await fetch(doc.originalUrl);
    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];

    const base64Data = signatureDataUrl.replace(/^data:image\/png;base64,/, '');
    const sigImageBytes = Buffer.from(base64Data, 'base64');
    const sigImage = await pdfDoc.embedPng(sigImageBytes);

    const { width } = lastPage.getSize();
    lastPage.drawImage(sigImage, {
      x: width - 220,
      y: 30,
      width: 180,
      height: 60,
    });

    const verificationId = uuidv4();
    const signedPdfBytes = await pdfDoc.save();
    const documentHash = generateHash(Buffer.from(signedPdfBytes));

    const uploadResult = await uploadToCloudinary(
      Buffer.from(signedPdfBytes),
      `signed_${Date.now()}`
    );

    doc.signedUrl = uploadResult.secure_url;
    doc.status = 'signed';
    doc.verificationId = verificationId;
    doc.documentHash = documentHash;
    doc.signedAt = new Date();
    await doc.save();

    await AuditLog.create({
      userId: req.user.id,
      action: 'SIGN',
      documentId: doc._id,
      ipAddress: req.ip,
      metadata: { verificationId, documentHash },
    });

    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/download/:id', async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    await AuditLog.create({
      userId: req.user.id,
      action: 'DOWNLOAD',
      documentId: doc._id,
      ipAddress: req.ip,
    });

    const fileUrl = doc.signedUrl || doc.originalUrl;

    // Convert Cloudinary raw URL to a forced inline/viewable URL
    const viewUrl = fileUrl.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');

    res.json({ url: fileUrl, viewUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;