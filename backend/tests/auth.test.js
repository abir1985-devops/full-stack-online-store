const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  test('POST /api/auth/signup creates a user', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe('admin@test.com');
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('POST /api/auth/login returns token', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'user@test.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });
});
