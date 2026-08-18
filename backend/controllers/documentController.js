const Document = require('../models/Document');

// @desc    Get all documents for logged in user
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user.id });
    res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const { title, description } = req.body;

    const document = await Document.create({
      title: title || req.file.originalname,
      description,
      owner: req.user.id,
      filePath: req.file.path,
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Make sure user is document owner
    if (document.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this document' });
    }

    await document.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
