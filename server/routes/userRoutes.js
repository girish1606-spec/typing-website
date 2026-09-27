import express from 'express';
import { getProfile, updateProfile, getUserStatistics } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/statistics', getUserStatistics);

export default router;
