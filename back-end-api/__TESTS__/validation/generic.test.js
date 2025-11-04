const {genericValidation, validateFields} = require("../../validation/generic")
const JWT_AUTH = require("../../middleware/auth")


describe('genericValidation', () => {
    it('should allow a valid token to resolve', async () => {
        JWT = `Bearer ${JWT_AUTH.generateToken(1)}`
        req = {}
        req.header = {}
        req.header.Authorization = JWT
        await expect(genericValidation(req)).resolves.toBeTruthy()
    })

    it('should reject an invalid token', async () => {
        JWT = `Bearer ${JWT_AUTH.generateToken(1)}3`
        req = {}
        req.header = {}
        req.header.Authorization = JWT
        await expect(genericValidation(req)).rejects.toBeFalsy()
    })

    it('should reject if a auth header is not present', async () => {
        req = {}
        req.header = {}
        await expect(genericValidation(req)).rejects.toBeFalsy()
    })
})

describe('validate fields', () => {
    it('should allow fields that are in the allowed list through', async () => {

    })

    it('should deny invalid fields from the list', async () => {

    })

    it('should allow empty bodies', async () => {

    })

    it('should not check datatypes', async () => {
        
    })
})