const {validateGetScore} = require('../../validation/drivingScore')
const JWT_AUTH = require("../../middleware/auth")

describe('genericValidation', () => {
    it('should allow a valid token to resolve', async () => {
        JWT = `Bearer ${JWT_AUTH.generateToken(1)}`
        req = {}
        req.header = {}
        req.header.Authorization = JWT
        await expect(validateGetScore(req, {}, {})).resolves.toBeUndefined() // undefined because it does not return anything if success
    })

    it('should reject an invalid token', async () => {
        JWT = `Bearer ${JWT_AUTH.generateToken(1)}3`
        req = {}
        req.header = {}
        req.header.Authorization = JWT
        await expect(genericValidation(req)).rejects.toStrictEqual({statusCode: 401, message:'No token attached'})
    })

    it('should reject if an auth header is not present', async () => {
        req = {}
        req.header = {}
        await expect(genericValidation(req)).rejects.toStrictEqual({statusCode: 401, message:'No token attached'})
    })

    it('should reject if body is present', async () => {

    })
})