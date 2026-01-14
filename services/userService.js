const bcrypt = require('bcrypt');
const { User } = require('../models/User');

exports.createUser = async (name, email, password) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('E-mail já cadastrado.');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  return await User.create({ name, email, password: hashedPassword });
};

exports.findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

exports.validatePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
