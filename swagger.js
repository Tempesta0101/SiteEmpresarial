const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Site Empresarial API',
      version: '1.0.0',
      description: 'Documentação da API do SaaS empresarial',
    },
  },
  apis: [__dirname + '/api/*.js'],
};

console.log('Swagger carregado. Caminho das rotas:', options.apis);
const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
