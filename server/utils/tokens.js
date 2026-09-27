import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'typespeed_jwt_super_secure_production_secret_key_change_me_in_prod';
const JWT_EXPIRES_IN = '7d';

/**
 * Generates a signed JWT token
 * @param {object} payload 
 * @returns {string}
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT token
 * @param {string} token 
 * @returns {object}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
