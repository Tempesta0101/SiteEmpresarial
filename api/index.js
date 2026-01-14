// Rotas de autenticação, usuários, planos, assinaturas
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

// Exemplo de rota protegida
router.get('/v1/me', authMiddleware, (req, res) => {
  // Retorna dados do usuário autenticado
  res.json({ user: req.user });
});

const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Cadastro de novo usuário
 *     tags:
 *       - Usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: E-mail já cadastrado
 */
router.post(
  '/v1/register',
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.register
);

router.post(
  '/v1/login',
  [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.login
);

// Endpoint para área do cliente (dados do usuário, plano, pagamentos)
router.get('/cliente', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    // Buscar assinatura e pagamentos do usuário
    const { Subscription } = require('../models/Subscription');
    const { Payment } = require('../models/Payment');
    const assinatura = await Subscription.findOne({ where: { UserId: user.id } });
    const pagamentos = await Payment.findAll({ where: { UserId: user.id }, order: [['createdAt', 'DESC']] });
    res.json({
      plano: assinatura ? assinatura.plan : '-',
      status: assinatura ? assinatura.status : '-',
      pagamentos: pagamentos.map(p => ({ valor: p.amount / 100, data: p.createdAt.toLocaleDateString() }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados do cliente.' });
  }
});

// Endpoint para cancelar assinatura
router.post('/cancelar', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { Subscription } = require('../models/Subscription');
    await Subscription.update({ status: 'cancelled' }, { where: { UserId: user.id } });
    res.json({ message: 'Assinatura cancelada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar assinatura.' });
  }
});

module.exports = router;
