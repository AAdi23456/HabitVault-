const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserPreference = sequelize.define('UserPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  darkMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  analyticsTimeRange: {
    type: DataTypes.ENUM('week', 'month', 'year'),
    defaultValue: 'week',
  },
  showMotivationalQuotes: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Foreign key to User, will be set up in associations
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

// This will be set up in a separate association file
// UserPreference.belongsTo(User);

module.exports = UserPreference; 