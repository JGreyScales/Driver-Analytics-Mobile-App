const {validateGetScore, validatePutScore} = require('../../validation/drivingScore')
const JWT_AUTH = require("../../middleware/auth")

describe('getDrivingScore', () => {
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
      
        await validateGetScore(req, res, next);
      
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
      
        await validateGetScore(req, res);
      
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
      
        await validateGetScore(req, res);
      
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
      
        await validateGetScore(req, res);
      
        // Assert the correct response
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('xx is not a valid field for this request');
    })
})

describe("putDrivingScore", () => {
  it('should allow uploading valid datasets', async () => {
    const JWT = `Bearer ${JWT_AUTH.generateToken(1)}`;
      
    const req = {
      header: {
        Authorization: JWT
      },
      body: {
        tripDuration: 57,
        incidentCount: 2,
        averageSpeed: 83,
        maxSpeed: 87,
      } // no invalid fields
    };
  
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  
    const next = jest.fn();
  
    await validatePutScore(req, res, next);
  
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  })

  it('should deny invalid token', async () => {
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
  
    await validateGetScore(req, res);
  
    // Assert the correct response
    expect(res.status).toHaveBeenCalledWith(401);
  })

  it('should deny no token', async () => {
    
  })

  // it('should deny not all body met')
})