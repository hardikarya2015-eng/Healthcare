const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

router.use(authenticate, requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);
router.get('/prescriptions', adminController.getPrescriptions);
router.patch('/prescriptions/:id/status', adminController.updatePrescriptionStatus);
router.get('/inventory', adminController.getInventory);
router.patch('/inventory/:id', adminController.updateInventory);

module.exports = router;
