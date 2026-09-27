import { User, TypingResult } from '../models/dbStore.js';

/**
 * Get current authenticated user profile
 */
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...sanitized } = user;
    return res.status(200).json({
      success: true,
      user: sanitized
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * Update user preferences and personal info
 */
export async function updateProfile(req, res) {
  try {
    const { name, preferences } = req.body;
    const updateData = {};

    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim();
    }

    if (preferences && typeof preferences === 'object') {
      const currentUser = await User.findById(req.user._id);
      updateData.preferences = {
        ...(currentUser.preferences || {}),
        ...preferences
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...sanitized } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Profile and preferences updated successfully.',
      user: sanitized
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

/**
 * Get comprehensive statistics for user dashboard
 */
export async function getUserStatistics(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch user typing test history
    const allTests = await TypingResult.find({ userId: String(userId) });
    const recentTests = allTests.slice(0, 15);

    // Compute progress overview
    const stats = user.typingStatistics || {
      testsCompleted: 0,
      totalPracticeTime: 0,
      bestWpm: 0,
      averageWpm: 0,
      bestAccuracy: 0,
      averageAccuracy: 0,
      lastWpm: 0,
    };

    return res.status(200).json({
      success: true,
      statistics: stats,
      recentTests,
      subscriptionStatus: user.subscriptionStatus
    });
  } catch (error) {
    console.error('getUserStatistics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve statistics.' });
  }
}
