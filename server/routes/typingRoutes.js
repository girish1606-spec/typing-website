import express from 'express';
import { getTypingTexts, saveTypingResult, getLeaderboard } from '../controllers/typingController.js';
import { verifyToken } from '../utils/tokens.js';
import { User } from '../models/dbStore.js';

const router = express.Router();

// Optional authentication middleware: attaches req.user if valid token provided
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    }
  } catch {
    // Continue without req.user
  }
  next();
}

router.get('/texts', getTypingTexts);
router.get('/leaderboard', getLeaderboard);
router.post('/results', optionalAuth, saveTypingResult);

export default router;
