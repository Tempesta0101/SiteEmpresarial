const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Subscription = require('./Subscription');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.INTEGER, allowNull: false }, // em centavos
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  paidAt: { type: DataTypes.DATE },
}, {
  timestamps: true,
});

Payment.belongsTo(Subscription);
Subscription.hasMany(Payment);

module.exports = Payment;
