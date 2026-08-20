const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[AUTH ROUTE] ${req.method} ${req.path} body:`, JSON.stringify(req.body));
  next();
});

router.post('/register', register);
router.post('/login', login);

module.exports = router;
