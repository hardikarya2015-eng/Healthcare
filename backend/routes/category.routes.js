const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getAll);
router.get('/:slug/products', categoryController.getProductsByCategory);
router.post('/', authenticate, requireRole('admin'), categoryController.create);
router.put('/:id', authenticate, requireRole('admin'), categoryController.update);

module.exports = router;
