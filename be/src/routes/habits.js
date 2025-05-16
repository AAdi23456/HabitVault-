const express = require('express');
const router = express.Router();
const { Habit, HabitLog } = require('../models');
const { Op } = require('sequelize');

// Get all habits for the authenticated user
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      habits
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching habits'
    });
  }
});

// Create a new habit for the authenticated user
router.post('/', async (req, res) => {
  try {
    // Add the userId to the habit data
    const habitData = {
      ...req.body,
      userId: req.user.id
    };
    
    const habit = await Habit.create(habitData);
    
    res.status(201).json({
      success: true,
      habit,
      message: 'Habit created successfully'
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error creating habit',
      error: error.message
    });
  }
});

// Get a single habit by ID (ensuring it belongs to the authenticated user)
router.get('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: HabitLog,
          limit: 30,
          order: [['date', 'DESC']]
        }
      ]
    });
    
    if (!habit) {
      return res.status(404).json({ 
        success: false,
        message: 'Habit not found'
      });
    }
    
    res.json({
      success: true,
      habit
    });
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching habit'
    });
  }
});

// Update a habit (ensuring it belongs to the authenticated user)
router.put('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!habit) {
      return res.status(404).json({ 
        success: false,
        message: 'Habit not found'
      });
    }
    
    await habit.update(req.body);
    
    res.json({
      success: true,
      habit,
      message: 'Habit updated successfully'
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating habit',
      error: error.message
    });
  }
});

// Delete a habit (ensuring it belongs to the authenticated user)
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!habit) {
      return res.status(404).json({ 
        success: false,
        message: 'Habit not found'
      });
    }
    
    await habit.destroy();
    
    res.json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting habit'
    });
  }
});

// Get habit logs for a specific habit
router.get('/:id/logs', async (req, res) => {
  try {
    // First, ensure the habit belongs to the user
    const habit = await Habit.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!habit) {
      return res.status(404).json({ 
        success: false,
        message: 'Habit not found'
      });
    }
    
    // Get date range from query params or use default (last 30 days)
    const { startDate, endDate } = req.query;
    const whereClause = { habitId: req.params.id };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const logs = await HabitLog.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    
    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Get habit logs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching habit logs'
    });
  }
});

// Log a habit completion or missed status
router.post('/:id/logs', async (req, res) => {
  try {
    // First, ensure the habit belongs to the user
    const habit = await Habit.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!habit) {
      return res.status(404).json({ 
        success: false,
        message: 'Habit not found'
      });
    }
    
    // Create or update log
    const { date, status, notes } = req.body;
    
    const [log, created] = await HabitLog.findOrCreate({
      where: {
        habitId: req.params.id,
        date: date || new Date()
      },
      defaults: {
        habitId: req.params.id,
        date: date || new Date(),
        status: status || 'completed',
        notes: notes || ''
      }
    });
    
    // If log already existed, update it
    if (!created) {
      await log.update({
        status: status || log.status,
        notes: notes !== undefined ? notes : log.notes
      });
    }
    
    // Update streak information in the habit
    await updateStreakInfo(habit.id);
    
    res.status(created ? 201 : 200).json({
      success: true,
      log,
      message: `Habit ${status || 'completed'} for ${date || 'today'}`
    });
  } catch (error) {
    console.error('Log habit error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error logging habit',
      error: error.message
    });
  }
});

// Update a specific log
router.put('/:habitId/logs/:date', async (req, res) => {
  try {
    // First, ensure the habit belongs to the user
    const habit = await Habit.findOne({
      where: { 
        id: req.params.habitId,
        userId: req.user.id
      }
    });
    
    if (!habit) {
      return res.status(404).json({ 
        success: false,
        message: 'Habit not found'
      });
    }
    
    // Find the log
    const log = await HabitLog.findOne({
      where: {
        habitId: req.params.habitId,
        date: req.params.date
      }
    });
    
    if (!log) {
      return res.status(404).json({ 
        success: false,
        message: 'Log not found'
      });
    }
    
    // Update the log
    await log.update(req.body);
    
    // Update streak information in the habit
    await updateStreakInfo(habit.id);
    
    res.json({
      success: true,
      log,
      message: 'Log updated successfully'
    });
  } catch (error) {
    console.error('Update log error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating log',
      error: error.message
    });
  }
});

// Get statistics for all habits
router.get('/stats/summary', async (req, res) => {
  try {
    // Get all habits for the user
    const habits = await Habit.findAll({
      where: { userId: req.user.id }
    });
    
    // Get completion stats for each habit
    const habitStats = await Promise.all(habits.map(async (habit) => {
      const completedLogs = await HabitLog.count({
        where: {
          habitId: habit.id,
          status: 'completed'
        }
      });
      
      const totalLogs = await HabitLog.count({
        where: {
          habitId: habit.id
        }
      });
      
      return {
        id: habit.id,
        name: habit.name,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        completionRate: totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0
      };
    }));
    
    // Calculate overall stats
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.isActive).length;
    const totalCompletedLogs = await HabitLog.count({
      where: {
        habitId: habits.map(h => h.id),
        status: 'completed'
      }
    });
    
    const totalLogs = await HabitLog.count({
      where: {
        habitId: habits.map(h => h.id)
      }
    });
    
    const overallCompletionRate = totalLogs > 0 ? (totalCompletedLogs / totalLogs) * 100 : 0;
    
    // Find best performing habit based on completion rate
    const bestHabit = habitStats.length > 0 
      ? habitStats.reduce((prev, current) => 
          prev.completionRate > current.completionRate ? prev : current)
      : null;
    
    res.json({
      success: true,
      stats: {
        totalHabits,
        activeHabits,
        overallCompletionRate,
        bestHabit,
        habitStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Helper function to update streak information for a habit
async function updateStreakInfo(habitId) {
  try {
    const habit = await Habit.findByPk(habitId);
    if (!habit) return;
    
    // Get all completed logs for this habit, ordered by date
    const logs = await HabitLog.findAll({
      where: {
        habitId: habitId
      },
      order: [['date', 'ASC']]
    });
    
    if (logs.length === 0) return;
    
    // Calculate current streak
    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate = null;
    
    // Process logs in reverse to calculate current streak
    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      const logDate = new Date(log.date);
      
      // If this is our first log or the log is for today
      if (lastDate === null) {
        if (log.status === 'completed') {
          currentStreak = 1;
        } else {
          break; // Not completed, current streak is 0
        }
      } else {
        // Check if this log is consecutive with the last one
        const dayDiff = Math.floor((lastDate - logDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1 && log.status === 'completed') {
          currentStreak++;
        } else {
          break; // Streak is broken
        }
      }
      
      lastDate = logDate;
    }
    
    // Process logs in order to find max streak
    let streak = 0;
    lastDate = null;
    
    for (const log of logs) {
      const logDate = new Date(log.date);
      
      if (log.status === 'completed') {
        if (lastDate === null) {
          streak = 1;
        } else {
          const dayDiff = Math.floor((logDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            streak++;
          } else if (dayDiff > 1) {
            streak = 1; // Reset streak but count this day
          }
          // If dayDiff === 0, it's the same day, don't count twice
        }
        
        maxStreak = Math.max(maxStreak, streak);
        lastDate = logDate;
      } else {
        streak = 0;
        lastDate = null;
      }
    }
    
    // Update the habit with the calculated streaks
    await habit.update({
      currentStreak,
      longestStreak: Math.max(maxStreak, habit.longestStreak)
    });
  } catch (error) {
    console.error('Update streak error:', error);
  }
}

module.exports = router; 