const express = require('express');
const router = express.Router();
const {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
  toggleInstitutionStatus,
} = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('root_admin', 'issuer', 'holder'), getInstitutions)
  .post(protect, authorize('root_admin'), createInstitution);

router.route('/:id')
  .get(protect, authorize('root_admin'), getInstitutionById)
  .put(protect, authorize('root_admin'), updateInstitution);

router.route('/:id/status')
  .patch(protect, authorize('root_admin'), toggleInstitutionStatus);

router.route('/:id/rotate-keys')
  .post(protect, authorize('root_admin'), require('../controllers/institutionController').rotateInstitutionKey);

module.exports = router;
