const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  try {
    const user = await userService.createUser(name, email, password);
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  try {
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }
    const valid = await userService.validatePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }
    // Gerar token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login realizado com sucesso!', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};
