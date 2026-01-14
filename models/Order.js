const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./User');
const Product = require('./Product');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  amount: { type: DataTypes.INTEGER, allowNull: false }, // em centavos
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

Order.belongsTo(User, { foreignKey: 'userId' });
Order.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { Order };
