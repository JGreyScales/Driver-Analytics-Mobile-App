const { validateGetUser, validatePutUser, validatePostUser } = require('../../validation/user')
const JWT_AUTH = require("../../middleware/auth")

describe('getUser', () => {
  it('should call next() when the token and request are valid', async () => {
    const JWT = `Bearer ${JWT_AUTH.generateToken(1)}`;

    const req = {
      header: {
        Authorization: JWT
      },
      body: {} // no invalid fields
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const next = jest.fn();

    await validateGetUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });


  it('should reject an invalid token', async () => {
    const JWT = `Bearer ${JWT_AUTH.generateToken(1)}3`;

    const req = {
      header: {
        Authorization: JWT
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await validateGetUser(req, res);

    // Assert the correct response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('No token attached');
  });
  it('should reject if an auth header is not present', async () => {
    const req = {
      header: {
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await validateGetUser(req, res);

    // Assert the correct response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('No token attached');
  })

  it('should reject if body is present', async () => {
    const JWT = `Bearer ${JWT_AUTH.generateToken(1)}`;

    const req = {
      header: {
        Authorization: JWT
      },
      body: {
        xx: 'xx'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await validateGetUser(req, res);

    // Assert the correct response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('xx is not a valid field for this request');
  })
})

describe('putUser', () => {
  it('should allow a valid user entry to pass', async () => {

    const req = {
      header: {
      },
      body: {
        username: 'xx',
        email: 'ttt',
        passwordHash: 'yyy'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const next = jest.fn();

    await validatePutUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  })


  it('should deny if not all fields are present', async () => {
    const req = {
      header: {
      },
      body: {
        username: 'xx',
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const next = jest.fn();

    await validatePutUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing required fields: email, passwordHash');
  })

  it('should deny if body is missing', async () => {
    const JWT = `Bearer ${JWT_AUTH.generateToken(1)}`;

    const req = {
      header: {
        Authorization: JWT
      },

    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const next = jest.fn();

    await validatePutUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing required fields: username, email, passwordHash');
  })
})

describe('postUser', () => {
  it('should allow a valid request through', async () => {
    JWT = `Bearer ${JWT_AUTH.generateToken(1)}`
    const req = {
      header: {
        Authorization: JWT
      },
      body: {
        username: 'xx',
        passwordHash: 'xxxx'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const next = jest.fn();

    await validatePostUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  })

  it('should deny if no token', async () => {

    const req = {
      header: {
      },
      body: {
        username: 'xx',
        passwordHash: 'tyyy'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await validateGetUser(req, res);

    // Assert the correct response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('No token attached');
  })

  it('it should deny if body is not valid', async () => {
    JWT = `Bearer ${JWT_AUTH.generateToken(1)}`
    const req = {
      header: {
        Authorization: JWT
      },
      body: {
        username: 'xx',
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const next = jest.fn();

    await validatePostUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing required fields: passwordHash');
  })

  it('should deny if unrequested body is present', async () => {
    JWT = `Bearer ${JWT_AUTH.generateToken(1)}`
    const req = {
      header: {
        Authorization: JWT
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    const next = jest.fn();

    await validatePostUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing required fields: username, passwordHash');
  })
})