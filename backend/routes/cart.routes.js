const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const cartController = require('../controllers/cart.controller');

router.use(authenticate); // all cart routes require auth

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:productId', cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
