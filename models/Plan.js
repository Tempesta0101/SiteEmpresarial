const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Plan = sequelize.define('Plan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false }, // em centavos
  description: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

module.exports = Plan;
