import crypto from 'crypto';
import { User } from '../models/dbStore.js';
import { hashPassword, comparePassword } from '../utils/passwords.js';
import { generateToken } from '../utils/tokens.js';

/**
 * Sanitizes user record for API responses (removes password hashes and sensitive tokens)
 */
function sanitizeUser(user) {
  const { passwordHash, resetPasswordToken, resetPasswordExpires, ...sanitized } = user;
  return sanitized;
}

/**
 * Register a new user
 */
export async function register(req, res) {
  try {
    let { name, email, password, confirmPassword } = req.body || {};

    if (!confirmPassword && password) {
      confirmPassword = password;
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Email, Password) are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please sign in or use another email.'
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashedPassword,
      role: 'user',
      subscriptionStatus: 'free',
      preferences: {
        theme: 'midnight',
        mode: 'dark',
        soundEnabled: true,
        soundType: 'mechanical',
        soundVolume: 70,
        accentColor: '#38bdf8',
        keyShape: 'rounded',
        keySize: 'standard',
        keySpacing: 'normal',
        keyAnimation: 'press',
        keyColor: 'default',
        borderRadius: 'rounded-xl',
        uiDensity: 'normal',
        animationIntensity: 'normal',
      },
      typingStatistics: {
        testsCompleted: 0,
        totalPracticeTime: 0,
        bestWpm: 0,
        averageWpm: 0,
        bestAccuracy: 0,
        averageAccuracy: 0,
        lastWpm: 0,
      }
    });

    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to TYPE SPEED.',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating your account. Please try again.'
    });
  }
}

/**
 * Normal User Sign In
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully. Welcome back!',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong during sign in. Please try again.'
    });
  }
}

/**
 * Developer Sign In (Completely separate from normal user login)
 */
export async function developerLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Developer email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const expectedEmail = (process.env.DEVELOPER_EMAIL || 'girish@gmail.com').toLowerCase().trim();
    const expectedPassword = process.env.DEVELOPER_PASSWORD || '1234567890';

    // Find developer in DB
    const devUser = await User.findOne({ email: cleanEmail });

    // Validate either against environment variables or verified developer user in DB
    let isAuthorized = false;
    let developerDoc = null;

    if (cleanEmail === expectedEmail && password === expectedPassword) {
      isAuthorized = true;
      developerDoc = devUser || {
        _id: 'dev-master-admin',
        name: process.env.DEVELOPER_NAME || 'Girish',
        email: cleanEmail,
        role: 'developer',
        subscriptionStatus: 'active',
        preferences: {},
        typingStatistics: {}
      };
    } else if (devUser && devUser.role === 'developer') {
      const match = await comparePassword(password, devUser.passwordHash);
      if (match) {
        isAuthorized = true;
        developerDoc = devUser;
      }
    }

    if (!isAuthorized || !developerDoc) {
      return res.status(401).json({
        success: false,
        message: 'Invalid developer credentials. Unauthorized access attempt recorded.'
      });
    }

    const token = generateToken({
      userId: developerDoc._id,
      email: developerDoc.email,
      role: 'developer'
    });

    return res.status(200).json({
      success: true,
      message: 'Developer authentication successful. Access granted to Developer Console.',
      token,
      user: sanitizeUser(developerDoc)
    });
  } catch (error) {
    console.error('Developer login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during developer authentication.'
    });
  }
}

/**
 * Developer Account Registration
 * Allows creating a new developer/admin account if Developer Secret Passcode matches.
 */
export async function developerRegister(req, res) {
  try {
    const { name, email, password, confirmPassword, developerSecret } = req.body;

    if (!name || !email || !password || !confirmPassword || !developerSecret) {
      return res.status(400).json({
        success: false,
        message: 'All fields including Developer Secret Passcode are required.'
      });
    }

    const expectedSecret = process.env.DEVELOPER_SECRET_KEY || 'DEV_ADMIN_SECRET_2025';
    if (developerSecret.trim() !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Developer Secret Passcode. Unauthorized registration attempt.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Developer password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please sign in or use another email.'
      });
    }

    const hashedPassword = await hashPassword(password);

    const newDeveloper = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashedPassword,
      role: 'developer',
      subscriptionStatus: 'active',
      preferences: {
        theme: 'cyber',
        mode: 'dark',
        soundEnabled: true,
        soundType: 'mechanical',
        soundVolume: 80,
        accentColor: '#eab308',
        keyShape: 'rounded',
        keySize: 'standard',
        keySpacing: 'normal',
        keyAnimation: 'glow',
        keyColor: 'default',
        borderRadius: 'rounded-xl',
        uiDensity: 'normal',
        animationIntensity: 'normal',
      },
      typingStatistics: {
        testsCompleted: 0,
        totalPracticeTime: 0,
        bestWpm: 0,
        averageWpm: 0,
        bestAccuracy: 0,
        averageAccuracy: 0,
        lastWpm: 0,
      }
    });

    const token = generateToken({
      userId: newDeveloper._id,
      email: newDeveloper.email,
      role: 'developer'
    });

    return res.status(201).json({
      success: true,
      message: 'Developer account created successfully! Access granted to Developer Console.',
      token,
      user: sanitizeUser(newDeveloper)
    });
  } catch (error) {
    console.error('Developer registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create developer account. Please try again.'
    });
  }
}

/**
 * Forgot Password Flow
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Registered email address is required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Do not disclose whether email exists for anti-scraping security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions and a recovery token have been generated.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully.',
      // In development/test mode, provide resetToken to make verification seamless
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
}

/**
 * Reset Password with Token
 */
export async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token, new password, and confirmation are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const user = await User.findOne({ resetPasswordToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token has expired. Please request a new one.'
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(user._id, {
      passwordHash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
}

/**
 * Forgot Email Recovery Flow
 */
export async function forgotEmail(req, res) {
  try {
    const { name, hint } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the name registered on your account.'
      });
    }

    const cleanName = name.trim().toLowerCase();
    const users = await User.find({});
    const matched = users.filter(u => u.name && u.name.toLowerCase() === cleanName);

    if (matched.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No verified account found matching the provided name. If you cannot recover your account, you can create a new account safely.'
      });
    }

    // Mask emails for security (e.g., "j****e@domain.com")
    const maskedResults = matched.map(u => {
      const parts = u.email.split('@');
      const namePart = parts[0];
      const domainPart = parts[1] || '';
      const maskedName = namePart.length > 2
        ? `${namePart[0]}${'*'.repeat(Math.max(namePart.length - 2, 2))}${namePart[namePart.length - 1]}`
        : `${namePart[0]}*`;
      return `${maskedName}@${domainPart}`;
    });

    return res.status(200).json({
      success: true,
      message: 'Account found. Here is your masked email hint:',
      hints: maskedResults
    });
  } catch (error) {
    console.error('Forgot email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not process email recovery.'
    });
  }
}
