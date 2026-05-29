const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { createPaymentIntent } = require('../controllers/payment.controller');

router.post('/create-intent', authenticate, createPaymentIntent);

module.exports = router;
