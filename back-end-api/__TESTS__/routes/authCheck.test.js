const request = require('supertest');
const express = require('express');
const auth = require("../../routes/authCheck");
const User = require("../../controllers/user")
const JWT_AUTH = require("../../middleware/auth")

const app = express();
app.use(express.json());
app.use('/auth', auth);

describe('authenticating a token', () => {
  it('should approve a valid token', async () => {
    const token = `Bearer ${JWT_AUTH.generateToken(1)}`

    const res = await request(app).get('/auth').set("Authorization", token);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Valid token provided');
  });

  it('should deny an invalid token', async () => {
    const token = `Bearer ${JWT_AUTH.generateToken(1)}3`

    const res = await request(app).get('/auth').set("Authorization", token);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid token provided');
  })

  it('should deny a misformatted token', async () => {
    const token = JWT_AUTH.generateToken(1)

    const res = await request(app).get('/auth').set("Authorization", token);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid token provided');
  })

  it('should deny a malformed request', async () => {
    const res = await request(app).get('/auth');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid token provided');
  })
});
