const Institution = require('../models/Institution');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// @desc    Create new institution
// @route   POST /api/institutions
// @access  Public (for now)
const createInstitution = async (req, res) => {
  try {
    const { name, code, contactEmail } = req.body;

    // Check if institution exists
    const institutionExists = await Institution.findOne({ code: code.toUpperCase() });

    if (institutionExists) {
      return res.status(400).json({ message: 'Institution with this code already exists' });
    }

    // Generate Ed25519 keypair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Save Private Key with version 1
    const keysDir = path.join(__dirname, '..', 'keys');
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { recursive: true });
    }
    
    const privateKeyPath = path.join(keysDir, `${code.toUpperCase()}_v1_private.pem`);
    fs.writeFileSync(privateKeyPath, privateKey);

    const institution = await Institution.create({
      name,
      code: code.toUpperCase(),
      contactEmail,
      publicKey: publicKey,
      currentKeyVersion: 1,
      keyHistory: [{
        version: 1,
        publicKey: publicKey
      }]
    });

    res.status(201).json(institution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Public
const getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({});
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single institution
// @route   GET /api/institutions/:id
// @access  Public
const getInstitutionById = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (institution) {
      res.json(institution);
    } else {
      res.status(404).json({ message: 'Institution not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update institution
// @route   PUT /api/institutions/:id
// @access  Public
const updateInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (institution) {
      institution.name = req.body.name || institution.name;
      institution.contactEmail = req.body.contactEmail || institution.contactEmail;

      const updatedInstitution = await institution.save();
      res.json(updatedInstitution);
    } else {
      res.status(404).json({ message: 'Institution not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activate/deactivate institution
// @route   PATCH /api/institutions/:id/status
// @access  Public
const toggleInstitutionStatus = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (institution) {
      // Toggle the current status
      institution.isActive = !institution.isActive;
      
      const updatedInstitution = await institution.save();
      res.json(updatedInstitution);
    } else {
      res.status(404).json({ message: 'Institution not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
  toggleInstitutionStatus,
};
