// Checklist de Pagamento SaaS
// 1. Configure .env com STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, MERCADOPAGO_ACCESS_TOKEN
// 2. Teste Stripe: use Stripe CLI ou pagamento real, verifique ativação automática
// 3. Teste Mercado Pago: gere link, pague, verifique ativação automática
// 4. (Opcional) Ative envio de e-mail de confirmação
// 5. Valide logs de webhook e status de assinatura
// 6. Pronto para produção!

require('dotenv').config();

const express = require('express');
const path = require('path');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = 4000; // Alterado para 4000

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const WebhookLog = require('./models/WebhookLog');
const { Subscription } = require('./models/Subscription');
const { User } = require('./models/User');
const { createCheckoutPreference } = require('./services/mercadoPagoService');
const nodemailer = require('nodemailer');

// Transporter para envio de e-mails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Segurança HTTP
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cors());
app.use(express.json());

// Middleware para forçar HTTPS em produção
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Rotas dinâmicas
app.get('/swagger-test', (req, res) => {
  res.send('Express dinâmico OK');
});

const apiRoutes = require('./api');
app.use('/api', apiRoutes);

// Documentação Swagger
require('./swagger')(app);

// Rota para criar sessão de checkout Stripe
app.post('/create-checkout-session', async (req, res) => {
  const { plan, name, email } = req.body;
  const plans = {
    'Básico': { price: 4900, name: 'Básico' },
    'Profissional': { price: 9900, name: 'Profissional' },
    'Premium': { price: 19900, name: 'Premium' }
  };
  if (!plans[plan]) {
    return res.status(400).json({ error: 'Plano inválido.' });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Assinatura ${plans[plan].name}`,
              metadata: { name }
            },
            unit_amount: plans[plan].price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:4000/sucesso.html', // Alterado para 4000
      cancel_url: 'http://localhost:4000/cancelado.html', // Alterado para 4000
      metadata: { name, plan },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento.' });
  }
});

// Rota de checkout (simulação)
app.post('/checkout', (req, res) => {
  const { plan } = req.body;
  if (!plan) {
    return res.status(400).json({ error: 'Plano não informado.' });
  }
  return res.json({ message: `Checkout iniciado para o plano: ${plan}` });
});

// Endpoint de webhook Stripe
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Salvar evento no banco
  await WebhookLog.create({ event: event.type, payload: event, receivedAt: new Date() });
  // Liberar acesso ao sistema se pagamento confirmado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;
    // Ativar assinatura do usuário
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ email, name: session.metadata.name || 'Novo Usuário', password: '', status: 'active' });
    }
    await Subscription.update({ status: 'active' }, { where: { UserId: user.id } });
    // Enviar e-mail de confirmação
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Assinatura Ativada',
      text: 'Sua assinatura Stripe foi ativada com sucesso!'
    });
  }
  res.json({ received: true });
});

app.post('/mercadopago/checkout', async (req, res) => {
  const { planId, userEmail, price } = req.body;
  try {
    const preference = await createCheckoutPreference({ planId, userEmail, price });
    res.json({ init_point: preference.init_point });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/mercadopago/webhook', async (req, res) => {
  const mpEvent = req.body;
  // Exemplo: ativar assinatura após pagamento aprovado
  try {
    if (mpEvent.type === 'payment' && mpEvent.data && mpEvent.data.status === 'approved') {
      const email = mpEvent.data.payer && mpEvent.data.payer.email;
      if (email) {
        let user = await User.findOne({ where: { email } });
        if (!user) {
          user = await User.create({ email, name: 'Novo Usuário', password: '', status: 'active' });
        }
        await Subscription.update({ status: 'active' }, { where: { UserId: user.id } });
        // Enviar e-mail de confirmação
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Assinatura Ativada',
          text: 'Sua assinatura Mercado Pago foi ativada com sucesso!'
        });
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));
// Servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
