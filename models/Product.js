const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.INTEGER, allowNull: false }, // em centavos
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Product;
