const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate, requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);
router.get('/prescriptions', adminController.getPrescriptions);
router.patch('/prescriptions/:id/status', adminController.updatePrescriptionStatus);
router.get('/inventory', adminController.getInventory);
router.patch('/inventory/:id', adminController.updateInventory);
router.post('/products/:id/image', upload.single('image'), adminController.uploadProductImage);

module.exports = router;
