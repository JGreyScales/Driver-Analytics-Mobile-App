const request = require('supertest');
const express = require('express');
const assurance = require("../../routes/assurance");

const app = express();
app.use(express.json());
app.use('/status', assurance);

describe('GET /status', () => {
  it('should return API online', async () => {
    const res = await request(app).get('/status');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('API online');
  });
});
