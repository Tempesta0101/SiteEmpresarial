const sequelize = require('./models/db');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');
const Payment = require('./models/Payment');
const Product = require('./models/Product');
const Order = require('./models/Order');
const WebhookLog = require('./models/WebhookLog');

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado com sucesso!');
  } catch (err) {
    console.error('Erro ao sincronizar o banco:', err);
  } finally {
    await sequelize.close();
  }
})();
