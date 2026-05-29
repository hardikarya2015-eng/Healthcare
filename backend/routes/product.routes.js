const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const productController = require('../controllers/product.controller');

// Public
router.get('/', productController.getProducts);
router.get('/suggestions', productController.getSuggestions);
router.get('/:id', productController.getProductById);

// Admin only
router.post('/', authenticate, requireRole('admin'), productController.createProduct);
router.put('/:id', authenticate, requireRole('admin'), productController.updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), productController.deleteProduct);

module.exports = router;
