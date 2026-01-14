const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const WebhookLog = sequelize.define('WebhookLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event: { type: DataTypes.STRING, allowNull: false },
  payload: { type: DataTypes.JSONB, allowNull: false },
  receivedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = WebhookLog;
