const express = require('express');
const router = express.Router();
const { User, UserPreference } = require('../models');

// Get user profile with preferences
router.get('/profile', async (req, res) => {
  try {
    // User is attached to req by auth middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }, // Exclude password from response
      include: [UserPreference]
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// Get user preferences
router.get('/preferences', async (req, res) => {
  try {
    // Find or create preferences for the user
    const [preferences, created] = await UserPreference.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id,
        darkMode: false,
        analyticsTimeRange: 'week',
        showMotivationalQuotes: true,
        notificationsEnabled: true
      }
    });

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences'
    });
  }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    // Find or create preferences
    const [preferences, created] = await UserPreference.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id,
        ...req.body
      }
    });

    // If preferences existed, update them
    if (!created) {
      await preferences.update(req.body);
    }

    res.json({
      success: true,
      preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences'
    });
  }
});

module.exports = router; 