const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Habit = require('./habit');

const HabitLog = sequelize.define('HabitLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('completed', 'missed', 'skipped'),
    allowNull: false,
    defaultValue: 'completed',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  // Foreign key to Habit, will be set up in associations
  habitId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Habits',
      key: 'id'
    }
  }
}, {
  indexes: [
    // Composite index for faster queries by habit and date
    {
      unique: true,
      fields: ['habitId', 'date']
    }
  ]
});

// This will be set up in a separate association file
// HabitLog.belongsTo(Habit);

module.exports = HabitLog; 