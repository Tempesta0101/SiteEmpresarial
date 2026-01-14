const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('siteempresarial', 'postgres', '99519663Pokemon', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
});

module.exports = sequelize;
