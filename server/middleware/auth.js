import { verifyToken } from '../utils/tokens.js';
import { User } from '../models/dbStore.js';

/**
 * Authentication middleware that verifies JWT and attaches user to request
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please sign in to continue.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid token. Please sign in again.'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please sign in again.'
      });
    }

    // Attach sanitized user to request
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      preferences: user.preferences,
      typingStatistics: user.typingStatistics
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error occurred.'
    });
  }
}

/**
 * Authorization middleware that ensures current user has Developer role
 */
export function requireDeveloper(req, res, next) {
  if (!req.user || req.user.role !== 'developer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Developer privileges required.'
    });
  }
  next();
}
