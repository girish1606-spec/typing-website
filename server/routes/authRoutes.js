import express from 'express';
import {
  register,
  login,
  developerLogin,
  developerRegister,
  forgotPassword,
  resetPassword,
  forgotEmail
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/developer/login', developerLogin);
router.post('/developer/register', developerRegister);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/forgot-email', forgotEmail);

export default router;
