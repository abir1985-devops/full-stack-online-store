const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');


const glob = require('glob');

const apisPattern = path.resolve(process.cwd(), 'routes/**/*.js');



const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Store API',
      version: '1.0.0',
      description: 'REST API for an online auto-parts store',
    },

    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],

    tags: [
      { name: 'Products', description: 'Product management' },
      { name: 'Auth', description: 'Authentication' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Users', description: 'User management' },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            reference: { type: 'string' },
            name: { type: 'string' },
            image: { type: 'string' },
            quantity: { type: 'integer' },
            description: { type: 'string' },
            price: { type: 'number' },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: [apisPattern],
};

module.exports = swaggerJSDoc(swaggerOptions);
