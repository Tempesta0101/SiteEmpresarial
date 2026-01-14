const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./User');
const Plan = require('./Plan');

const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  endDate: { type: DataTypes.DATE },
}, {
  timestamps: true,
});

Subscription.belongsTo(User);
Subscription.belongsTo(Plan);
User.hasMany(Subscription);
Plan.hasMany(Subscription);

module.exports = Subscription;
