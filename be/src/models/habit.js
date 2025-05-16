const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Habit = sequelize.define('Habit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  // Target days: Every Day, Weekdays, Custom - stored as a JSON array of days
  targetDays: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  },
  // Frequency can be daily, weekly, specific days, etc.
  frequency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'daily',
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Foreign key to User, will be set up in associations
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

// This will be set up in a separate association file
// Habit.belongsTo(User);

module.exports = Habit; 