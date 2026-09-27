import express from 'express';
import {
  getPaymentConfig,
  submitPayment,
  getUserPayments,
  getPaymentById
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/config', getPaymentConfig);
router.post('/submit', submitPayment);
router.get('/history', getUserPayments);
router.get('/:id', getPaymentById);

export default router;
