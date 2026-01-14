const { Subscription } = require('../models/Subscription');

// Middleware para validar acesso ao sistema vendido
module.exports = (requiredPlan = null) => async (req, res, next) => {
  try {
    const userId = req.user.id;
    const assinatura = await Subscription.findOne({ where: { UserId: userId } });
    if (!assinatura || assinatura.status !== 'active') {
      return res.status(403).json({ error: 'Assinatura inativa ou não encontrada.' });
    }
    if (requiredPlan && assinatura.plan !== requiredPlan) {
      return res.status(403).json({ error: 'Plano incompatível para este sistema.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao validar acesso.' });
  }
};
