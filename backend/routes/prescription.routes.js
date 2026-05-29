const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const prescriptionController = require('../controllers/prescription.controller');

// In-memory storage — file never touches disk or cloud storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP or PDF allowed'));
  },
});

router.use(authenticate);

// POST /api/prescriptions  — upload image, OCR, recommend (one step)
router.post('/', upload.single('prescription'), prescriptionController.analyze);

// GET /api/prescriptions   — history (metadata only, no file URLs)
router.get('/', prescriptionController.getMyPrescriptions);

// Admin
router.patch('/:id/status', requireRole('admin'), prescriptionController.updateStatus);

module.exports = router;
