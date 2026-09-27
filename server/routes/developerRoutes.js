import express from 'express';
import {
  getDeveloperStats,
  getAllPayments,
  approvePayment,
  rejectPayment,
  processRefund,
  getAllUsers
} from '../controllers/developerController.js';
import { authenticateToken, requireDeveloper } from '../middleware/auth.js';

const router = express.Router();

// Require both valid JWT and Developer role
router.use(authenticateToken);
router.use(requireDeveloper);

router.get('/stats', getDeveloperStats);
router.get('/payments', getAllPayments);
router.post('/payments/:id/approve', approvePayment);
router.post('/payments/:id/reject', rejectPayment);
router.post('/payments/:id/refund', processRefund);
router.get('/users', getAllUsers);

export default router;
