const request = require('supertest');
const app = require('../app');
const Product = require('../models/productModel');

describe('Products API', () => {
  test('GET /api/products returns paginated list', async () => {
    await Product.insertMany([
      { reference: 'T-1', name: 'Test Product 1', price: 10, quantity: 5, description: 'a', image: '' },
      { reference: 'T-2', name: 'Test Product 2', price: 20, quantity: 5, description: 'b', image: '' },
      { reference: 'T-3', name: 'Test Product 3', price: 30, quantity: 5, description: 'c', image: '' },
    ]);

    const res = await request(app).get('/api/products?page=1&limit=2');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.results).toBe(2);
    expect(res.body.total).toBe(3);
    expect(res.body.data.products).toHaveLength(2);
  });
});
