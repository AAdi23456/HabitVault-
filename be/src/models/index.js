const User = require('./User');
const Habit = require('./habit');
const HabitLog = require('./HabitLog');
const UserPreference = require('./UserPreference');

// User has many Habits
User.hasMany(Habit, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
Habit.belongsTo(User, {
  foreignKey: 'userId',
});

// Habit has many HabitLogs
Habit.hasMany(HabitLog, {
  foreignKey: 'habitId',
  onDelete: 'CASCADE',
});
HabitLog.belongsTo(Habit, {
  foreignKey: 'habitId',
});

// User has one UserPreference
User.hasOne(UserPreference, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
UserPreference.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = {
  User,
  Habit,
  HabitLog,
  UserPreference,
}; 