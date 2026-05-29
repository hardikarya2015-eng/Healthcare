const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

module.exports = router;
