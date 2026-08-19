const express = require('express');
const router = express.Router();
const {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
  toggleInstitutionStatus,
} = require('../controllers/institutionController');

router.route('/')
  .get(getInstitutions)
  .post(createInstitution);

router.route('/:id')
  .get(getInstitutionById)
  .put(updateInstitution);

router.route('/:id/status')
  .patch(toggleInstitutionStatus);

module.exports = router;
