const axios = require('axios');

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MP_BASE_URL = 'https://api.mercadopago.com';

async function createCheckoutPreference({ planId, userEmail, price }) {
  const preference = {
    items: [{
      title: `Plano ${planId}`,
      quantity: 1,
      unit_price: price
    }],
    payer: { email: userEmail },
    back_urls: {
      success: 'https://SEU_DOMINIO/success',
      failure: 'https://SEU_DOMINIO/failure',
      pending: 'https://SEU_DOMINIO/pending'
    },
    auto_return: 'approved',
    notification_url: 'https://SEU_DOMINIO/mercadopago/webhook'
  };
  const response = await axios.post(
    `${MP_BASE_URL}/checkout/preferences`,
    preference,
    { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
  );
  return response.data;
}

module.exports = { createCheckoutPreference };
